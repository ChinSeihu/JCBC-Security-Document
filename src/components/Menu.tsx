"use client";

import { useCallback, useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import { Menu } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { routeAccessMap } from "@/lib/settings";

const menuItems = [
  {
    key: "0",
    icon: <AppstoreOutlined />,
    label: "Home",
    href: '/home'
  },
  {
    key: "1",
    icon: <AppstoreOutlined />, 
    label: "Menu",
    children: [
      {
        key: "document-list",
        href: "/document/list",
        label: "ドキュメント一覧",
      },
      {
        key: "document-view",
        href: "/document/view",
        label: "ドキュメント閲覧",
      },
      {
        key: "question-list",
        href: "/question/list",
        label: "問題集",
      },
    ],
  },
];

const SideMenu = () => {
  const { user } = useUser();
  const router = useRouter();
  const role = user?.publicMetadata.role as string;
  console.log(role, 'role>>>>>>>')

  const getMemu = () => {
    return menuItems.filter(it => {
      const permissionList = routeAccessMap[it.href as string]
      if (permissionList && !permissionList?.includes(role)) return false
  
      if (it?.children?.length) {
        it.children = it?.children?.filter(child => {
          return routeAccessMap[child.href]?.includes(role)
        })
      }
      return true
    })
  }

  const handleMemuClick = (handler: any ) => {
    const { item } = handler;
    console.log(item.props.href, 'handleMemuClick')
    router.push(item.props.href);
  }

  return (
    <div className="mt-4 text-sm">
      <Menu onClick={handleMemuClick} mode="inline" defaultSelectedKeys={['0']} items={getMemu()} />
    </div>
  );
};

export default SideMenu;
