# Nest Boiler Plate

nest 프로젝트를 시작할때 기본적으로 사용할 공통 기능, 객체 등을 미리 만들어 놓은 프로젝트입니다.

## CommonResponse

## Exception

## Swagger

## Interceptor

`TransformInterceptor`
응답의 결과가 배열일 경우 모든 결과를 내보이는 일이 거의 없기 때문에
배열로 응답 시 페이징과 관련된 객체로 리턴하게 해주는 interceptor
```javascript
@Injectable()
export class TransformInterceptor<T, R> implements NestInterceptor<T, R> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<R> {
    return next.handle().pipe(
      map((data) => {
        const http = context.switchToHttp();
        const request = http.getRequest<ExpressRequest>();

        if (Array.isArray(data)) {
          return {
            items: data,
            page: Number(request.query['page'] || 1),
            size: Number(request.query['size'] || 20),
          };
        }

        return data;
      }),
    );
  }
}
```
