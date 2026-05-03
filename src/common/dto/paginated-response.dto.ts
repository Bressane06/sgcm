export class PaginatedResponseDto<List> {
  data!: List[];

  meta!: {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
