import { ButtonProps } from "antd"

export const SCORE_LINE = 0.8

export const isPass = (point: number = 0) => point >= SCORE_LINE

export enum FILE_TYPE {
	PDF = "1"
}

export enum QUESTION_TYPE_EUNM {
	SINGLE_CHOICE = "SINGLE_CHOICE",
	MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
}

export const QUESTION_TYPE = {
	[QUESTION_TYPE_EUNM.SINGLE_CHOICE]: "単一選択",
	[QUESTION_TYPE_EUNM.MULTIPLE_CHOICE]: "多肢選択"
}

 export const FILE_TYPE_TEXT = {
	[FILE_TYPE.PDF]: 'PDF'
 } 

 export const operateBtnProperty: ButtonProps = {
   className: 'text-xs',
   color: "primary",
   variant: "filled"
 }