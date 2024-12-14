import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { AiOutlineUser, AiOutlineSetting, AiOutlineMenu, AiOutlineLogout } from "react-icons/ai";
import { Menu } from "antd";
import { useEffect, useState } from "react";
import supabase from "../supabase";

const LayoutPage = () => {
  const [collapse, setCollapse] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState();

  const list_menu = [
    {
      key: "toggleMenu",
      icon: <AiOutlineMenu />,
      label: "hide",
      onClick: () => {
        setCollapse((prev) => !prev);
      },
    },
    {
      key: "/",
      icon: <RxDashboard />,
      label: "dashboard",
    },
    {
      key: "/attendances",
      icon: <AiOutlineUser />,
      label: "attendances",
    },
    {
      key: "/setting",
      icon: <AiOutlineSetting />,
      label: "setting",
    },
  ];

  const h_list_menu = [
    {
      key : "user",
      label : username,
      icon : <AiOutlineUser/>,
      children : [
        {
          key : 'setting',
          label : 'setting',
          icon : <AiOutlineSetting/>
        },
        {
          key : "logout",
          label : "logout",
          icon : <AiOutlineLogout/>,
          onClick : ()=>{
            supabase.auth.signOut()
              .then(res => {
                console.info(res)
                window.location.href = '/'
              })
          }
        }
      ]
    }
  ]

  const handleMenuClick = (e) => {
    if (e.key !== "toggleMenu") {
      navigate(e.key);
    }
  };

  useEffect(()=>{
    supabase.auth.getSession()
    .then(res => {
      setUsername(res.data.session.user.email)
    })
  }, [])

  return (
    <main className={`flex w-[100dvw] h-[100dvh] overflow-x-hidden`}>
      <div className={`h-full flex flex-col sticky top-0 left-0 `}>
        <Menu
          defaultSelectedKeys={[location.pathname]}
          items={list_menu}
          mode="inline"
          inlineCollapsed={collapse}
          onClick={handleMenuClick}
          className="h-full sticky"
        />
      </div>


      <div className="flex-1 min-h-[200dvh] py-2 overflow-y-auto">
         <Menu mode="horizontal" items={h_list_menu} className={`justify-end px-24`}/>
         <div className={`min-h[200dvh] max-w-[1200px] mx-auto p-6`}>
           <Outlet />  
         </div>
      </div>
    </main>
  );
};

export default LayoutPage;
