"use client";

import { useEffect, useMemo, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Menu } from "antd";
import { AppstoreOutlined, FileTextOutlined, HistoryOutlined, HomeOutlined, ProfileOutlined, ReadOutlined, ScheduleOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { routeAccessMap } from "@/lib/settings";

const menuItems = () => [
  {
    key: "0",
    icon: <HomeOutlined />,
    label: "Home",
    href: '/home'
  },
  {
    key: "1",
    icon: <AppstoreOutlined />, 
    label: "Menu",
    children: [
      {
        key: "10",
        href: "/document/list",
        label: "ドキュメント",
        icon: <FileTextOutlined />, 
      },
      {
        key: "11",
        href: "/document/view",
        label: "ドキュメント閲覧",
        icon: <ReadOutlined />,
      },
      {
        key: "12",
        href: "/history/list",
        label: "テスト履歴",
        icon: <HistoryOutlined />,
      },
      {
        key: "13",
        href: "/question/list",
        label: "問題集",
        icon: <ProfileOutlined />,
      },
      {
        key: "14",
        href: "/testResult/list",
        label: "テスト結果",
        icon: <ScheduleOutlined />,
      },
    ],
  },
];

const SideMenu = () => {
  const { user } = useUser();
  const router = useRouter();
  const role = user?.publicMetadata.role as string;
  const currentUrl = usePathname()
  const [viewMenu, setMenu] = useState(menuItems());
  console.log(role, 'role>>>>>>>')

  useEffect(() => {
    const menu = getMenu(role);
    setMenu(menu);
  }, [role])

  const getMenu = (role: string) => {
    return menuItems().filter(it => {
      const permissionList = routeAccessMap[it.href as string]
      if (permissionList && !permissionList?.includes(role)) return false
      if (it?.children?.length) {
        it.children = it?.children?.filter(child => {
          return routeAccessMap[child.href]?.includes(role)
        })
        return it?.children?.length
      }

      return true
    })
  }

  const defaultOpenCheckedKey = useMemo(() => {
    const openKey: string[] = []
    const selectedKey: string[] = []
    viewMenu.forEach(it => {
      let itKey = it.key
      if (it.children?.length) {
        const checkedChild = it.children.find(child => child.href === currentUrl)
        if (checkedChild) {
          openKey.push(itKey)
          selectedKey.push(checkedChild.key)
        } 
      }
    })

    return { openKey, selectedKey }
  }, [viewMenu, currentUrl])

  const handleMenuClick = (handler: any ) => {
    const { item } = handler;
    console.log(item.props.href, 'handleMemuClick')
    router.push(item.props.href);
  }

  const { openKey, selectedKey } = defaultOpenCheckedKey

  return (
    <div className="mt-4 text-sm">
      <Menu 
        onClick={handleMenuClick} 
        mode="inline" 
        defaultSelectedKeys={selectedKey}
        items={viewMenu}
        inlineIndent={16}
        defaultOpenKeys={openKey}
      />
    </div>
  );
};

export default SideMenu;
