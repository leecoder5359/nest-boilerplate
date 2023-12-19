# Nest Boiler Plate

nest 프로젝트를 시작할때 기본적으로 사용할 공통 기능, 객체 등을 미리 만들어 놓은 프로젝트입니다.

## CommonResponse
`CommonRes` 공통 응답 객체
```javascript
export class CommonRes<T> {
  @ApiProperty({ required: true, example: '성공 여부' })
  success: boolean;

  @ApiProperty({ required: true, example: '성공시 메세지' })
  message: string;

  @ApiProperty({ required: true, example: '정렬방식' })
  sort: PageSort;

  @ApiProperty({ required: true, example: '응답 객체 || 응답 메세지' })
  data: T;

  constructor(success: boolean, message: string, data: T) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static of<T>(message: string, data: T) {
    return new CommonRes(true, message, data);
  }
}
```

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
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

`Roles`
역할에 따른 인가를 위한 데코레이터
```javascript
// User Entity에 사용될 Enum을 사용하면 됨
export enum Role {
  Admin = 'ADMIN',
  User = 'USER',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

```

`User`
요청에 포함된 유저 정보를 가져오기위한 데코레이터
```javascript
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export interface UserAfterAuth {
  id: string;
}
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

## Middleware

`LoggerMiddleware`
요청에 들어온 기본적인 정보를 로깅하기 위한 미들웨어
```javascript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(@Inject(Logger) private readonly logger: LoggerService) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl: url } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      this.logger.log(
        `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
```

### Guard

`ThrottlerBehindProxyGuard`
호출 횟수 제한을 위한 Guard
```javascript
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
    protected getTracker(req: Record<string, any>): Promise<string> {
        return req.ips.length ? req.ips[0] : req.ip;
    }
}
```
횟수 제한 예시
```javascript
@Module({
    imports: [
        ThrottlerModule.forRoot([
            {
                limit: 10,
                ttl: 60000, // 분당 10회 제한
            },
        ]),
        ...
})
export class AppModule implements NestModule {
    ...
}

```
```javascript
@UseGuards(ThrottlerBehindProxyGuard)
@Controller('api/videos')
export class VideoController {
    ...
}
```
