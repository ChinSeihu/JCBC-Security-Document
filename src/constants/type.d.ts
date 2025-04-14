export interface IPagination {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number
} 

export type TPagination = IPagination & PaginationProps;

export type ClientPrisma = Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$disconnect" | "$connect" | "$on" | "$transaction" | "$use" | "$extends">
