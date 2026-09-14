export interface Pagination<T> {
	data: T[];
	page: number;
	totalItems: number;
	totalPages: number;
}
