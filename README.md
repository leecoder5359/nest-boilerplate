# Nest Boiler Plate

nest 프로젝트를 시작할때 기본적으로 사용할 공통 기능, 객체 등을 미리 만들어 놓은 프로젝트입니다.

## CommonResponse

## Exception

## Swagger

### Decorator
`ApiGetResponse` Get요청 결과 예시를 나타내기 위한 데코레이터
```javascript
export const ApiGetResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [{ $ref: getSchemaPath(model) }],
      },
    }),
  );
};
```
`ApiPostResponse` Post요청 결과 예시를 나타내기 위한 데코레이터
```javascript
export const ApiPostResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiCreatedResponse({
      schema: {
        allOf: [{ $ref: getSchemaPath(model) }],
      },
    }),
  );
};
```
`ApiGetItemsResponse` Get요청 시 Paging 결과 예시를 나타내기 위한 데코레이터
```javascript
export const ApiGetItemsResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PageResDto) },
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
            required: ['items'],
          },
        ],
      },
    }),
  );
};
```
`PageResDto` 예시
```javascript
export class PageResDto<T> {
  @ApiProperty({ required: true })
  page: number;

  @ApiProperty({ required: true })
  size: number;

  items: T[];
}
```

## Decorator

`Public`
인가를 거치지 않고 api 사용을 위한 데코레이터
```javascript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

`Roles`
역할에 따른 인가를 위한 데코레이터
```javascript
import { SetMetadata } from '@nestjs/common';

// User Entity에 사용될 Enum을 사용하면 됨
export enum Role {
  Admin = 'ADMIN',
  User = 'USER',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

```

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
