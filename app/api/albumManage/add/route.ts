'use server'
import BizResult from '@/utils/BizResult';
import {query} from "@/utils/db";
import {NextRequest} from 'next/server'
import {verifyAuth} from "@/utils/auth/auth";
import {randomImages} from "@/utils/third-party-tools";

export async function POST(req: NextRequest) {
    try {
        const {user_id: userId} = await verifyAuth(req)
        const jsonData = await req.json();
        let {albumName, description,albumCover} = jsonData;
        // 参数有效性检查
        if (!albumName || !description) {
            // 参数不完整
            return BizResult.validateFailed('', '参数不完整');
        }
        // 查询albumName是否有重复的
        const albumNameResult = await query(
            `SELECT * FROM albums WHERE album_name = $1 AND user_id = $2;`,
            [albumName, userId]
        );
        if (albumNameResult.rows.length > 0) {
            // 相册名称重复
            return BizResult.fail('', '相册名称重复');
        }
        albumCover = albumCover || await randomImages()
        console.log('albumCover',albumCover)
        await query(
            `INSERT INTO albums(album_name, description, user_id, album_cover, created_at, updated_at) VALUES ( $1, $2, $3, $4, NOW(), NOW()) RETURNING album_id;`,
            [albumName, description, userId, albumCover]
        );

        return BizResult.success('', '新增相册成功');
    } catch (error) {
        console.log(error);
        return BizResult.fail('', '系统异常');
    }
}
