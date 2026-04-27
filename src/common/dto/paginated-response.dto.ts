export class PaginatedResponseDto<List> {
  items!: List[];

  meta!: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}