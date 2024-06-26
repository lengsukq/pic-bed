'use server'
import BizResult from '@/utils/BizResult';
import {query} from "@/utils/db";
import {NextRequest} from 'next/server'
import {verifyAuth} from "@/utils/auth/auth";

export async function POST(req: NextRequest) {
    try {
        const {user_id: userId} = await verifyAuth(req)
        const jsonData = await req.json();
        const {albumName, current, pageSize} = jsonData;
        // 参数有效性检查
        if (!current || !pageSize) {
            // 参数不完整
            return BizResult.validateFailed('', '参数不完整');
        }
        const offset = (current - 1) * pageSize; // 计算要跳过的记录数
        const totalResult = await query(
            'SELECT COUNT(*) FROM albums WHERE user_id = $1;',
            [userId]
        );
        // 查询当前页数据，联合images表查询
        const result = await query(
            `SELECT albums.*, COUNT(images.image_id) AS image_count
                FROM albums
                LEFT JOIN images ON albums.album_id = images.album_id
                WHERE albums.user_id = $1
                 AND ($2 = '' OR albums.album_name ILIKE $2)
                 GROUP BY albums.album_id
                 ORDER BY albums.album_id ASC
                 LIMIT $3 OFFSET $4;`,
            [userId, `%${albumName || ""}%`, pageSize, offset] // 使用参数化查询防止 SQL 注入
        );
        // console.log('result',result)
        return BizResult.success({
            record: result.rows,
            total: Number(totalResult.rows[0].count)
        }, '查询相册列表成功');
    } catch (error) {
        console.log(error);
        return BizResult.fail('', '系统异常');
    }
}
