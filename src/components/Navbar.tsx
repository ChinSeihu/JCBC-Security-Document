import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Dropdown, Space } from 'antd';

const Navbar = () => {
  const { data: session } = useSession({ required: true });
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a onClick={() => signOut()}>
          <LogoutOutlined style={{ marginRight: 12 }}/>Logout
        </a>
      ),
    }
  ]
  
  return (
    <div className="flex items-center justify-between p-4">
      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="" width={20} height={20} />
        </div>
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="" width={20} height={20} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">{session?.user?.name}</span>
          <span className="text-[10px] text-gray-500 text-right leading-none" >
            {session?.user?.email}
          </span>
        </div>
        <></>
        {/* <UserButton /> */}
        <Dropdown menu={{ items }}>
          <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
        </Dropdown>
        {/* {signOut()} */}
      </div>
    </div>
  );
};

export default Navbar;
