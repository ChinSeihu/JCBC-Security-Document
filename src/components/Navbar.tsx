import { useSession, signOut } from "next-auth/react";
import { LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Dropdown } from 'antd';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];
const color = ColorList[Math.ceil(Math.random() * 10) % 4]
const Navbar = () => {
  const { data: session } = useSession<any>({ required: true });
  console.log(session, 'session>>>')
  const router = useRouter()
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

  useEffect(() => {
    if (!session) router.push('/auth')
  }, [router, session])

  const user: any = session?.user;
  
  return (
    <div className="flex items-center justify-between p-3">
      {/* ICONS AND USER */}
      <div className="flex items-center gap-4 justify-end w-full">
        {/* <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="" width={20} height={20} />
        </div>
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="" width={20} height={20} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div>
        </div> */}
        <div className="flex flex-col items-end">
          <span className="text-xs leading-3 font-medium">{user?.name}</span>
          <span className="text-[10px] text-gray-500 text-right leading-none" >
            {user?.email}
          </span>
        </div>
        <></>
        <Dropdown menu={{ items }}>
          <Avatar style={{ cursor: 'pointer',backgroundColor: color, verticalAlign: 'middle' }}>{user?.family_name}</Avatar>
        </Dropdown>
      </div>
    </div>
  );
};

export default Navbar;
