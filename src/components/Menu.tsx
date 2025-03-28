"use client";

import { useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import { Menu } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    key: "0",
    icon: <AppstoreOutlined />,
    label: "Home",
    visible: ["admin", "employee"],
    href: '/home'
  },
  {
    key: "1",
    icon: <AppstoreOutlined />,
    label: "Menu",
    visible: ["admin", "employee"],
    children: [
      {
        key: "document-list",
        href: "/document/list",
        label: "ドキュメント一覧",
        visible: ["admin"],
      },
      {
        key: "document-view",
        href: "/document/view",
        label: "ドキュメント閲覧",
        visible: ["admin", "employee"],
      },
      {
        key: "question-list",
        href: "/question/list",
        label: "問題集",
        visible: ["admin"],
      },
    ],
  },
];

const SideMenu = () => {
  const { user } = useUser();
  const router = useRouter();
  const role = user?.publicMetadata.role as string;
  console.log(user, 'role>>>>>>>')

  const viewMenu = useMemo(() => menuItems.filter(it => {
    if (!it.visible.includes(role)) return false

    if (it?.children?.length) {
      it?.children?.filter(child => child.visible.includes(role))
    }
    return true
  }), [role])

  const handleMemuClick = (handler: any ) => {
    const { item } = handler;
    console.log(item.props.href, 'handleMemuClick')
    router.push(item.props.href);
  }

  return (
    <div className="mt-4 text-sm">
      <Menu onClick={handleMemuClick} mode="inline" defaultSelectedKeys={['0']} items={viewMenu} />
    </div>
  );
};

export default SideMenu;
