"use client";

import { useEffect, useMemo, useState } from "react"
import { Menu } from "antd";
import { AppstoreOutlined, FileTextOutlined, HistoryOutlined, HomeOutlined, ProfileOutlined, ReadOutlined, ScheduleOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { routeAccessMap } from "@/lib/settings";
import { useSessionInfo } from "@/lib";

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
        label: "閲覧と受験",
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
  const session = useSessionInfo();
  const router = useRouter();
  const roles = session?.roles;
  const currentUrl = usePathname()
  const [viewMenu, setMenu] = useState(menuItems());
  console.log(roles, 'role>>>>>>>')

  useEffect(() => {
    const menu = getMenu([...(roles || []), 'employee']); //デフォルトで社員権限に設定
    setMenu(menu);
  }, [roles])

  const getMenu = (roles: string[] = []) => {
    return menuItems().filter(it => {
      const permissionList = routeAccessMap[it.href as string]
      if (permissionList && !permissionList?.some(it => roles.some(role => role.includes(it)))) return false
      if (it?.children?.length) {
        it.children = it?.children?.filter(child => {
          return routeAccessMap[child.href]?.some(it => roles.some(role => role.includes(it)))
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

  const getMenuHref = (keyPath: string []) => {
    let menulist = viewMenu.slice()
    let item: any
    while (keyPath.length) {
      const key = keyPath.pop()
      item = menulist.find(it => it.key === key);
      if (keyPath.length) menulist = item?.children
    }
    return item?.href
  }

  const handleMenuClick = ({ keyPath }: any ) => {
    const href = getMenuHref(keyPath)
    console.log(href, 'handleMemuClick')
    router.push(href);
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
