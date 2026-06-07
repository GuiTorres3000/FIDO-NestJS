# Design Document: NestJS Base Project

## Overview

This design document outlines the architecture and implementation approach for a production-ready NestJS base project that follows market-standard patterns suitable for startup projects. The project provides a solid foundation for building scalable web applications with a clear separation between backend API and frontend client.

### Goals

- Provide a well-structured monorepo with NestJS backend and webpack-based frontend
- Implement industry-standard patterns for authentication, validation, and error handling
- Enable rapid development with hot-reload and efficient build processes
- Ensure code quality through automated testing and linting
- Support multiple deployment environments with secure configuration management
- Deliver comprehensive documentation for quick team onboarding

### Non-Goals

- Microservices architecture (this is a monolithic application)
- GraphQL API (REST-only)
- Real-time features using WebSockets (can be added later)
- Multi-tenancy support (single-tenant application)
- Advanced caching strategies (basic caching only)

## Architecture

### High-Level Architecture

The project follows a monorepo structure with clear separation of concerns:

```
nestjs-base-project/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   ├── config/         # Configuration
│   │   └── main.ts         # Application entry point
│   ├── test/               # E2E tests
│   └── package.json
├── frontend/               # Webpack-based client
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── index.ts
│   ├── webpack.config.js
│   └── package.json
├── shared/                 # Shared types and utilities
└── package.json           # Root workspace configuration
```

### Architectural Patterns

1. **Modular Architecture**: Each feature is encapsulated in a NestJS module with its own controllers, services, entities, and DTOs
2. **Layered Architecture**: Clear separation between presentation (controllers), business logic (services), and data access (repositories)
3. **Dependency Injection**: Leveraging NestJS's built-in DI container for loose coupling and testability
4. **Repository Pattern**: Abstracting data access through repositories for database independence
5. **DTO Pattern**: Using Data Transfer Objects for request/response validation and transformation
6. **Guard Pattern**: Implementing authentication and authorization through NestJS guards
7. **Interceptor Pattern**: Cross-cutting concerns like logging and response transformation through interceptors
8. **Exception Filter Pattern**: Centralized error handling through custom exception filters

### Technology Stack

**Backend:**
- NestJS 10.x (Node.js framework)
- TypeScript 5.x (type-safe JavaScript)
- TypeORM or Prisma (ORM)
- PostgreSQL (database)
- JWT (authentication)
- bcrypt (password hashing)
- class-validator & class-transformer (validation)
- Swagger/OpenAPI (API documentation)
- Winston or Pino (logging)
- Jest (testing)

**Frontend:**
- Webpack 5 (bundler)
- TypeScript 5.x
- SASS or PostCSS (styling)
- ESLint & Prettier (code quality)

**Development Tools:**
- Husky (Git hooks)
- ESLint (linting)
- Prettier (formatting)
- Jest (testing)
- Supertest (API testing)

## Components and Interfaces

### 1. Project Generator Component

**Responsibility:** Scaffold the initial project structure with all necessary files and configurations.

**Key Functions:**
- `generateMonorepoStructure()`: Creates the root directory structure with backend, frontend, and shared folders
- `scaffoldBackend()`: Generates NestJS application with modular architecture
- `scaffoldFrontend()`: Creates webpack-based frontend setup
- `generateConfigFiles()`: Creates TypeScript, ESLint, Prettier, Jest configurations
- `generateDocumentation()`: Creates README, CONTRIBUTING, and other documentation files

**Output:**
- Complete project directory structure
- Configuration files for all tools
- Package.json files with scripts and dependencies
- Example implementations for common patterns

### 2. Configuration Manager Module

**Responsibility:** Manage environment-specific configuration and secrets.

**Interface:**
```typescript
interface ConfigService {
  get<T>(key: string): T;
  getOrThrow<T>(key: string): T;
  validate(): void;
}

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

interface AppConfig {
  port: number;
  environment: 'development' | 'staging' | 'production';
  corsOrigins: string[];
  apiPrefix: string;
}
```

**Implementation Details:**
- Uses `@nestjs/config` package with `ConfigModule.forRoot()`
- Validates required environment variables at startup using Joi or class-validator
- Supports `.env`, `.env.development`, `.env.production` files
- Prevents logging of sensitive values through custom sanitization

### 3. Database Layer Module

**Responsibility:** Provide database connectivity and data access abstractions.

**Interface:**
```typescript
interface Repository<T> {
  find(options?: FindOptions): Promise<T[]>;
  findOne(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

interface TransactionManager {
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}

interface MigrationRunner {
  run(): Promise<void>;
  revert(): Promise<void>;
  generate(name: string): Promise<void>;
}
```

**Implementation Details:**
- TypeORM or Prisma integration with PostgreSQL
- Connection pooling configuration (min: 2, max: 10 connections)
- Migration system for schema version control
- Repository pattern for each entity
- Transaction support for complex operations
- Health check integration to verify connectivity

### 4. Authentication Module

**Responsibility:** Handle user authentication and authorization.

**Interface:**
```typescript
interface AuthService {
  register(dto: RegisterDto): Promise<AuthResponse>;
  login(dto: LoginDto): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<AuthResponse>;
  validateUser(email: string, password: string): Promise<User | null>;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}
```

**Guards:**
- `JwtAuthGuard`: Validates JWT tokens on protected routes
- `RolesGuard`: Checks user roles for authorization
- `LocalAuthGuard`: Validates username/password for login

**Decorators:**
- `@Public()`: Marks routes as publicly accessible
- `@Roles(...roles)`: Specifies required roles for route access
- `@CurrentUser()`: Injects authenticated user into route handler

**Implementation Details:**
- JWT token generation with configurable expiration
- Refresh token mechanism with separate secret and longer expiration
- Password hashing using bcrypt with salt rounds of 10
- Role-based access control using custom metadata and guards
- Returns 401 for invalid/expired tokens

### 5. API Documentation Module

**Responsibility:** Generate and serve OpenAPI/Swagger documentation.

**Implementation Details:**
- Uses `@nestjs/swagger` package
- Decorators on DTOs and controllers for schema generation
- Swagger UI served at `/api/docs`
- API versioning using URL path (`/api/v1/`)
- Consistent response format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorDetails;
  meta?: PaginationMeta;
}

interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
```

### 6. Validation Pipeline

**Responsibility:** Validate and sanitize incoming requests.

**Implementation Details:**
- Global `ValidationPipe` configured in main.ts
- DTOs with class-validator decorators:
```typescript
class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;
}
```
- Separate DTOs for create, update, and response operations
- Automatic transformation using `class-transformer`
- Whitelist unknown properties to prevent mass assignment
- Returns 400 with detailed validation errors

### 7. Error Handler Module

**Responsibility:** Centralize error handling and provide consistent error responses.

**Interface:**
```typescript
interface ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void;
}

class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void;
}

class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void;
}
```

**Exception Mapping:**
- `BadRequestException` → 400
- `UnauthorizedException` → 401
- `ForbiddenException` → 403
- `NotFoundException` → 404
- `ConflictException` → 409
- `InternalServerErrorException` → 500

**Implementation Details:**
- Global exception filter registered in main.ts
- Logs full error stack with request context
- Returns sanitized error messages to clients
- Includes request ID in error responses for tracing
- Never exposes sensitive information in error messages

### 8. Logger Module

**Responsibility:** Provide structured logging with request context.

**Interface:**
```typescript
interface Logger {
  debug(message: string, context?: string): void;
  info(message: string, context?: string): void;
  warn(message: string, context?: string): void;
  error(message: string, trace?: string, context?: string): void;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  requestId?: string;
  userId?: string;
  [key: string]: any;
}
```

**Implementation Details:**
- Winston or Pino for structured logging
- Request ID middleware to track requests across logs
- Log levels configurable per environment (debug in dev, info in prod)
- Sensitive data filtering (passwords, tokens, credit cards)
- JSON format for production, pretty-print for development

### 9. CORS and Security Module

**Responsibility:** Configure security headers and CORS policies.

**Implementation Details:**
- Helmet middleware for security headers
- CORS configuration with environment-specific origins
- Rate limiting using `@nestjs/throttler` (10 requests per minute per IP)
- CSRF protection for state-changing operations
- Content Security Policy headers
- HTTPS enforcement in production

### 10. Build System

**Responsibility:** Compile, bundle, and optimize code for development and production.

**Backend Build:**
- TypeScript compilation with strict mode
- Source maps for debugging
- Hot-reload using `nest start --watch`
- Production build with optimization

**Frontend Build:**
- Webpack 5 with TypeScript loader
- Hot Module Replacement (HMR) for development
- Code splitting for optimal bundle sizes
- CSS preprocessing with SASS/PostCSS
- Asset optimization and minification
- Environment-based configuration injection

**Configuration:**
```javascript
// webpack.config.js structure
module.exports = (env, argv) => ({
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },
  module: {
    rules: [
      // TypeScript, CSS, asset rules
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  devServer: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
```

### 11. Health Check Module

**Responsibility:** Provide application health status and metrics.

**Endpoints:**
- `GET /health`: Returns overall application health
- `GET /health/db`: Returns database connectivity status
- `GET /metrics`: Returns basic application metrics

**Response Format:**
```typescript
interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
  };
}

interface HealthCheck {
  status: 'ok' | 'down';
  message?: string;
  responseTime?: number;
}
```

**Implementation Details:**
- Uses `@nestjs/terminus` for health checks
- Database ping check with timeout
- Memory usage monitoring
- Graceful shutdown handling for SIGTERM/SIGINT

## Data Models

### User Entity

```typescript
@Entity('users')
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'simple-array', default: [] })
  roles: string[];

  @Column({ nullable: true })
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
```

### Configuration Schema

```typescript
interface EnvironmentVariables {
  // Application
  NODE_ENV: 'development' | 'staging' | 'production';
  PORT: number;
  API_PREFIX: string;

  // Database
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // CORS
  CORS_ORIGINS: string; // comma-separated

  // Logging
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}
```

## Error Handling

### Error Categories

1. **Validation Errors (400)**
   - Invalid input format
   - Missing required fields
   - Type mismatches
   - Business rule violations

2. **Authentication Errors (401)**
   - Invalid credentials
   - Expired tokens
   - Missing authentication

3. **Authorization Errors (403)**
   - Insufficient permissions
   - Role requirements not met

4. **Not Found Errors (404)**
   - Resource does not exist
   - Endpoint not found

5. **Conflict Errors (409)**
   - Duplicate resource
   - Concurrent modification

6. **Server Errors (500)**
   - Unhandled exceptions
   - Database connection failures
   - External service failures

### Error Response Format

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "email must be a valid email address"
      }
    ]
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Error Handling Strategy

- All exceptions caught by global exception filter
- Validation errors include field-level details
- Server errors log full stack trace but return generic message
- Request ID included for tracing
- Sensitive information never exposed in error responses
- Database errors mapped to appropriate HTTP status codes

## Testing Strategy

This project involves infrastructure setup, configuration management, and framework integration, which are not suitable for property-based testing. Instead, we will use a combination of unit tests, integration tests, and snapshot tests.

### Testing Approach

**1. Unit Tests**
- Test individual services, utilities, and helpers in isolation
- Mock external dependencies (database, external APIs)
- Focus on business logic and data transformations
- Target: 80%+ coverage for services and utilities

**2. Integration Tests**
- Test API endpoints with real database (test database)
- Verify authentication and authorization flows
- Test validation pipeline with various inputs
- Test error handling and response formats

**3. End-to-End Tests**
- Test critical user flows (registration, login, CRUD operations)
- Use test database with seeded data
- Verify frontend-backend integration

**4. Snapshot Tests**
- Test configuration file generation
- Verify project structure scaffolding
- Test API documentation generation

### Test Organization

```
backend/
├── src/
│   └── modules/
│       └── users/
│           ├── users.service.spec.ts      # Unit tests
│           └── users.controller.spec.ts   # Unit tests
└── test/
    ├── users.e2e-spec.ts                  # E2E tests
    └── health.e2e-spec.ts                 # E2E tests
```

### Testing Tools and Configuration

- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library for API testing
- **@nestjs/testing**: NestJS testing utilities
- **Test Database**: Separate PostgreSQL database for testing
- **Factories**: Test data factories for generating entities
- **Mocks**: Mock implementations for external services

### Test Examples

**Unit Test Example:**
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should create a user with hashed password', async () => {
    const dto = { email: 'test@example.com', password: 'Password123' };
    const result = await service.create(dto);
    
    expect(result.email).toBe(dto.email);
    expect(result.password).not.toBe(dto.password);
    expect(result.password).toMatch(/^\$2[aby]\$/); // bcrypt hash
  });
});
```

**Integration Test Example:**
```typescript
describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST) - should register new user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.user.email).toBe('newuser@example.com');
      });
  });

  it('/auth/login (POST) - should reject invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword',
      })
      .expect(401)
      .expect((res) => {
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      });
  });
});
```

### Test Data Management

- Use factories for generating test entities
- Seed test database with known data for E2E tests
- Clean up test data after each test
- Use transactions for test isolation when possible

### Continuous Integration

- Run tests on every commit using Git hooks (Husky)
- Run full test suite in CI/CD pipeline
- Generate coverage reports
- Fail builds if coverage drops below threshold

### Why Property-Based Testing Is Not Applicable

Property-based testing (PBT) is not suitable for this project because:

1. **Infrastructure as Code**: Project scaffolding and configuration are declarative, not functions with input/output behavior
2. **Framework Integration**: Testing NestJS, TypeORM, and webpack integration requires integration tests, not property tests
3. **One-Time Setup**: Most components are one-time setup (project generation, configuration) rather than functions that process varying inputs
4. **External Dependencies**: Many features depend on external services (database, authentication) that are better tested with integration tests

Instead, we use:
- **Snapshot tests** for configuration and scaffolding
- **Integration tests** for API endpoints and database operations
- **Unit tests** for business logic and utilities
- **E2E tests** for critical user flows

This approach provides comprehensive coverage appropriate for infrastructure and configuration-heavy projects.

## Implementation Notes

### Development Workflow

1. **Initial Setup**
   ```bash
   npm install
   npm run setup:db  # Run migrations
   npm run seed      # Seed initial data
   ```

2. **Development**
   ```bash
   npm run dev       # Start backend and frontend with hot-reload
   ```

3. **Testing**
   ```bash
   npm run test      # Run unit tests
   npm run test:e2e  # Run E2E tests
   npm run test:cov  # Generate coverage report
   ```

4. **Building**
   ```bash
   npm run build     # Build for production
   npm run start:prod # Start production server
   ```

### Package Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "nest start --watch",
    "dev:frontend": "webpack serve --mode development",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "nest build",
    "build:frontend": "webpack --mode production",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "migration:generate": "typeorm migration:generate",
    "migration:run": "typeorm migration:run",
    "migration:revert": "typeorm migration:revert",
    "seed": "ts-node src/database/seeds/run-seed.ts",
    "docs:generate": "nest build && npx @compodoc/compodoc -p tsconfig.json"
  }
}
```

### Security Considerations

1. **Password Security**
   - Use bcrypt with 10 salt rounds
   - Never log or expose passwords
   - Enforce strong password requirements

2. **Token Security**
   - Use strong random secrets (minimum 32 characters)
   - Short-lived access tokens (15 minutes)
   - Longer-lived refresh tokens (7 days)
   - Store refresh tokens hashed in database

3. **Input Validation**
   - Validate all inputs using DTOs
   - Sanitize inputs to prevent injection
   - Whitelist allowed properties

4. **CORS Configuration**
   - Restrict origins in production
   - Allow credentials only for trusted origins
   - Configure appropriate headers

5. **Rate Limiting**
   - Implement per-IP rate limiting
   - Stricter limits for authentication endpoints
   - Return 429 Too Many Requests when exceeded

6. **Dependency Security**
   - Regular dependency updates
   - Use npm audit to check vulnerabilities
   - Pin major versions of critical dependencies

### Performance Considerations

1. **Database**
   - Connection pooling (max 10 connections)
   - Indexes on frequently queried fields
   - Pagination for list endpoints
   - Lazy loading for relations

2. **Caching**
   - Cache configuration values
   - Consider Redis for session storage
   - Cache frequently accessed data

3. **Build Optimization**
   - Code splitting for frontend
   - Tree shaking to remove unused code
   - Minification and compression
   - CDN for static assets

4. **API Performance**
   - Compression middleware (gzip)
   - Response caching headers
   - Efficient database queries
   - Avoid N+1 query problems

### Deployment Considerations

1. **Environment Variables**
   - Never commit .env files
   - Use secrets management in production
   - Validate all required variables at startup

2. **Database Migrations**
   - Run migrations before deployment
   - Test migrations on staging first
   - Keep migrations reversible

3. **Health Checks**
   - Configure load balancer health checks
   - Implement graceful shutdown
   - Handle SIGTERM signals properly

4. **Logging**
   - Use structured JSON logging in production
   - Configure log aggregation (e.g., CloudWatch, Datadog)
   - Set appropriate log levels per environment

5. **Monitoring**
   - Application performance monitoring (APM)
   - Error tracking (e.g., Sentry)
   - Uptime monitoring
   - Database performance monitoring

## Conclusion

This design provides a solid foundation for building scalable web applications with NestJS. The architecture follows industry best practices and provides the necessary infrastructure for rapid development while maintaining code quality and security. The modular structure allows for easy extension and maintenance as the application grows.

The testing strategy focuses on integration tests, unit tests, and snapshot tests, which are appropriate for infrastructure and configuration-heavy projects. This approach ensures comprehensive coverage without the overhead of property-based testing, which is not suitable for this type of project.
