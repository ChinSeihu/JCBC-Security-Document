import { ButtonProps } from "antd"

export const SCORE_LINE = 1

export const isPass = (point: number = 0) => point >= SCORE_LINE

export enum FILE_TYPE {
	PDF = "1"
}

export enum QUESTION_TYPE_EUNM {
	SINGLE_CHOICE = "単一選択",
	MULTIPLE_CHOICE = "多肢選択"
}
export enum QUESTION_CODE_EUNM {
	SINGLE_CHOICE = "SINGLE_CHOICE",
	MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
}

 export const FILE_TYPE_TEXT = {
	[FILE_TYPE.PDF]: 'PDF'
 } 

export const primaryColor = '#1677ff'

 export const operateBtnProperty: ButtonProps = {
   className: 'text-xs',
   color: "primary",
   variant: "filled"
 }

 export const publicEnum = {
   closed: { text: '未公開', status: 'Default' },
   open: { text: '公開中', status: 'Success' },
 }

 export enum PUBLIC_STATUS_ENUM {
	CLOSED = 'closed',
	OPEN = 'open'
 }

 export const resultOption = [
	{value: 1, label: '合格'}, 
	{value: 0, label: '不合格'},
	{value: 2, label: '未実施'},
]