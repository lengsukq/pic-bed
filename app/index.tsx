'use client'
import {
    CrownOutlined, InfoCircleOutlined, MergeCellsOutlined, QuestionCircleOutlined,
    TabletOutlined, UserOutlined,
} from '@ant-design/icons';
import UserLogin from "@/components/userLogin"
import React, {useState} from 'react';
import dynamic from "next/dynamic";
import {getUserInfo, logout, UserInfoInter} from "@/utils/client/apihttp";
import {message} from "antd";
import {usePathname, useRouter} from "next/navigation";
import UserInfo from "@/components/userInfo";
const ProLayout = dynamic(
    () => import("@ant-design/pro-components").then((com) => com.ProLayout),
    {ssr: false}
);

export default function MenuContainer({children}: Readonly<{ children: React.ReactNode; }>) {
    const [pathname, setPathname] = useState('/welcome');
    const [openLogin, setOpenLogin] = useState(false);
    const [openUserInfo, setOpenUserInfo] = useState(false);

    const [userInfo,setUserInfo] = useState<UserInfoInter>({
        BILIBILI_CSRF: null,
        BILIBILI_SESSDATA: null,
        IMGBB_API: null,
        SM_TOKEN: null,
        TG_URL: null,
        updated_at: "", created_at: "", email: "", username: ""})
    const logoutAct =async () => {
        console.log('退出')
        await logout().then((res)=>{
            if (res.code===200){
                message.success(res.msg)
            }
            console.log('logout',res)
        })
    }
    const router = useRouter()
    const nowPathname = usePathname();

    // const { push } = useRouter();
    //
    // useEffect(() => {
    //     console.log('nowPathname',nowPathname)
    //     push('/user/login');
    // }, []);
    const excludePaths = ["/user/login"];
    if (excludePaths.includes(nowPathname)){
        return <>
            {children}
        </>
    }
    return (
        <>
        <UserLogin openLogin={openLogin} onChange={(e: boolean)=>setOpenLogin(e)}/>
        <UserInfo openUserInfo={openUserInfo} setOpenUserInfo={(e: boolean)=>setOpenUserInfo(e)} userInfo={userInfo}/>
        <div
            id="test-pro-layout"
            style={{
                height: '100vh',
            }}
        >
            <ProLayout
                title={'Pic-Su'}
                logo={'https://i.ibb.co/bKN1t8J/b-39d762806a8d59b0015a4c98927abaf8.jpg'}
                fixSiderbar
                route={{
                    path: '/',
                    routes: [
                        {
                            name: '图片上传',
                            icon: <TabletOutlined/>,
                            path: '/',
                        },
                        {
                            path: '/admin',
                            name: '管理页',
                            icon: <CrownOutlined/>,
                            routes: [
                                {
                                    path: '/tokenManage',
                                    name: 'token管理',
                                    icon: <CrownOutlined/>,
                                },
                                {
                                    path: '/albumManage',
                                    name: '相册管理',
                                    icon: <CrownOutlined/>,
                                }
                            ],
                        },
                    ],
                }}
                location={{
                    pathname,
                }}
                avatarProps={{
                    icon: <UserOutlined/>,
                    size: 'small',
                    title: 'Pic-Su',
                    onClick: () => {
                        getUserInfo().then(res=>{
                            if (res.code===200){
                                setUserInfo(res.data)
                                setOpenUserInfo(true)
                            }else {
                                setOpenLogin(true)
                            }
                        })
                    },
                }}
                actionsRender={() => [
                    <InfoCircleOutlined key="InfoCircleOutlined"/>,
                    <QuestionCircleOutlined key="QuestionCircleOutlined"/>,
                    <MergeCellsOutlined key="MergeCellsOutlined"/>,
                ]}
                menuFooterRender={(props) => {
                    if (props?.collapsed) return undefined;
                    return (
                        <p onClick={logoutAct}
                            style={{
                                textAlign: 'center',
                                color: 'rgba(0,0,0,0.6)',
                                paddingBlockStart: 12,
                            }}
                        >
                            Power by Pic-Su
                        </p>
                    );
                }}
                onMenuHeaderClick={(e) => console.log(e)}
                menuItemRender={(item, dom) => (
                    <a
                        onClick={() => {
                            router.push(item.path as string)
                            // setPathname(item.path || '/welcome');
                        }}
                    >
                        {dom}
                    </a>
                )}
            >
                {children}
            </ProLayout>
        </div>
        </>

    );
};