export interface UseCase<IRequest, IResponse> {
  run(request: IRequest): Promise<IResponse> | IResponse;
}
