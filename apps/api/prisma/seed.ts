import { Prisma, PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';
import * as bcrypt from 'bcrypt';

// ============================================
// Datos para generación de excepciones
// ============================================

const EXCEPTION_MESSAGES = [
  // Errores de Dependency Injection / IoC
  'Autofac.Core.DependencyResolutionException: An exception was thrown while activating ApplicationCore.Services.UserService -> ApplicationCore.Repositories.DatabaseContext -> EntityFrameworkCore.SqlServerProvider',
  'System.InvalidOperationException: Unable to resolve service for type "IEmailService" while attempting to activate "NotificationController"',
  'Microsoft.Extensions.DependencyInjection.Abstractions.ServiceNotFoundException: No service for type "ICacheService" has been registered',
  
  // Errores de autenticación y autorización
  'System.UnauthorizedAccessException: Access to the path "/admin/settings" is denied. User does not have the required role "Administrator"',
  'Microsoft.AspNetCore.Authentication.AuthenticationException: JWT token validation failed. Signature verification failed with error: InvalidSignature',
  'System.Security.SecurityException: The current identity does not have permission to access resource "UserManagement"',
  'IdentityServer4.ResponseHandling.TokenErrorException: invalid_grant - The provided authorization code is invalid, expired, or revoked',
  
  // Errores de base de datos
  'System.Data.SqlClient.SqlException: Timeout expired. The timeout period elapsed prior to completion of the operation or the server is not responding',
  'Microsoft.EntityFrameworkCore.DbUpdateException: An error occurred while updating the entries. See the inner exception for details',
  'Npgsql.PostgresException: 23505: duplicate key value violates unique constraint "users_email_key". Detail: Key (email)=(user@example.com) already exists',
  'System.Data.Entity.Infrastructure.DbUpdateConcurrencyException: Store update, insert, or delete statement affected an unexpected number of rows (0)',
  'MySql.Data.MySqlClient.MySqlException: Deadlock found when trying to get lock; try restarting transaction',
  
  // Errores de red y conexión
  'System.Net.Http.HttpRequestException: Connection refused. Unable to connect to remote server at https://api.payment-gateway.com',
  'System.Net.WebException: The operation has timed out after 30000ms',
  'System.Net.Sockets.SocketException: No connection could be made because the target machine actively refused it (10.0.1.55:5432)',
  'RestSharp.RestException: Request to https://external-api.com/v1/users failed with status code 503 Service Unavailable',
  
  // Errores de serialización
  'Newtonsoft.Json.JsonSerializationException: Error converting value "2024-13-45" to type "System.DateTime". Path "transaction.date"',
  'System.Xml.XmlException: Invalid character in the given encoding. Line 142, position 37',
  'System.Runtime.Serialization.SerializationException: Member "UserId" was not found in type "UserDTO"',
  
  // Errores de validación
  'FluentValidation.ValidationException: Validation failed: Email must be a valid email address, Password must be at least 8 characters',
  'System.ComponentModel.DataAnnotations.ValidationException: The field Amount must be between 0.01 and 999999.99',
  'ArgumentNullException: Value cannot be null. Parameter name: userId (at UserService.GetUserById)',
  'System.ArgumentOutOfRangeException: startIndex cannot be larger than length of string. Actual value was 156. Parameter name: startIndex',
  
  // Errores de archivo y recursos
  'System.IO.FileNotFoundException: Could not find file "C:\\App\\Config\\appsettings.Production.json"',
  'System.IO.DirectoryNotFoundException: Could not find a part of the path "D:\\Uploads\\Images\\2024\\01"',
  'System.UnauthorizedAccessException: Access to the path "C:\\ProgramData\\AppLogs" is denied',
  'System.IO.IOException: The process cannot access the file because it is being used by another process',
  
  // Errores de memoria y recursos del sistema
  'System.OutOfMemoryException: Exception of type "System.OutOfMemoryException" was thrown while processing large dataset (2.4GB)',
  'System.StackOverflowException: The process has exceeded the stack size limit (recursive call detected in CalculateUserHierarchy)',
  'System.Threading.ThreadAbortException: Thread was being aborted during long-running operation',
  
  // Errores de API externa y servicios
  'Stripe.StripeException: Your card was declined. Code: card_declined. Decline code: insufficient_funds',
  'SendGrid.Exceptions.SendGridException: Failed to send email. Status: 403 Forbidden. Message: Permission denied, wrong credentials',
  'Amazon.S3.AmazonS3Exception: Access Denied. Status Code: 403. Error Code: AccessDenied',
  'Twilio.Exceptions.ApiException: Unable to create record: The "To" phone number is not a valid phone number',
  
  // Errores de lógica de negocio
  'ApplicationCore.Exceptions.InsufficientBalanceException: Cannot process withdrawal of $500.00. Current balance: $230.45',
  'ApplicationCore.Exceptions.OrderAlreadyProcessedException: Order #ORD-2024-001234 has already been processed and cannot be modified',
  'ApplicationCore.Exceptions.ProductOutOfStockException: Product "Premium Subscription" is currently out of stock. Available: 0, Requested: 1',
  'ApplicationCore.Exceptions.InvalidStateTransitionException: Cannot transition order from "Delivered" to "Processing"',
  
  // Errores de configuración
  'System.Configuration.ConfigurationErrorsException: Configuration system failed to initialize. Missing required section "ConnectionStrings"',
  'Microsoft.Extensions.Options.OptionsValidationException: DataAnnotation validation failed for members: "ApiKey" with the error: "The ApiKey field is required"',
  
  // Errores de caché y Redis
  'StackExchange.Redis.RedisConnectionException: It was not possible to connect to the redis server(s). UnableToConnect on redis-cluster-01:6379',
  'StackExchange.Redis.RedisTimeoutException: Timeout performing GET user:session:abc123, inst: 0, qs: 0, in: 0, serverEndpoint: Unspecified/redis-01:6379',
  
  // Errores de rate limiting y throttling
  'System.InvalidOperationException: Rate limit exceeded for IP 192.168.1.100. Maximum 100 requests per minute. Try again in 45 seconds',
];

const STACK_TRACES = [
  // Stack trace 1: Autofac DependencyResolution (estilo .NET)
  `Autofac.Core.DependencyResolutionException: An exception was thrown while activating ApplicationCore.Services.UserService -> ApplicationCore.Repositories.UserRepository -> Microsoft.EntityFrameworkCore.DbContext.
   ---> Autofac.Core.DependencyResolutionException: An exception was thrown while invoking the constructor 'Void .ctor(Microsoft.EntityFrameworkCore.DbContextOptions)' on type 'ApplicationDbContext'.
   ---> System.InvalidOperationException: No database provider has been configured for this DbContext. A provider can be configured by overriding the DbContext.OnConfiguring method or by using AddDbContext on the application service provider.
   at Microsoft.EntityFrameworkCore.Infrastructure.Internal.InfrastructureExtensions.GetRequiredInfrastructure[TService](IInfrastructure infrastructure)
   at Microsoft.EntityFrameworkCore.Internal.DbContextServices.Initialize(IServiceProvider scopedProvider, IDbContextOptions contextOptions, DbContext context)
   at Microsoft.EntityFrameworkCore.DbContext..ctor(DbContextOptions options)
   at ApplicationCore.Infrastructure.ApplicationDbContext..ctor(DbContextOptions`1 options)
   at lambda_method42(Closure, Object[])
   at Autofac.Core.Activators.Reflection.BoundConstructor.Instantiate()
   --- End of inner exception stack trace ---
   at Autofac.Core.Activators.Reflection.BoundConstructor.Instantiate()
   at Autofac.Core.Activators.Reflection.ReflectionActivator.<>c__DisplayClass14_0.<UseSingleConstructorActivation>b__0(ResolveRequestContext context, Action\`1 next)
   at Autofac.Core.Resolving.Middleware.DisposalTrackingMiddleware.Execute(ResolveRequestContext context, Action\`1 next)
   at Autofac.Core.Resolving.Middleware.ActivatorErrorHandlingMiddleware.Execute(ResolveRequestContext context, Action\`1 next)
   --- End of inner exception stack trace ---
   at Autofac.Core.Resolving.Middleware.ActivatorErrorHandlingMiddleware.Execute(ResolveRequestContext context, Action\`1 next)
   at Autofac.Core.Lifetime.LifetimeScope.CreateSharedInstance(Guid id, Func\`1 creator)
   at Autofac.Core.Resolving.Middleware.SharingMiddleware.Execute(ResolveRequestContext context, Action\`1 next)
   at Autofac.Core.Resolving.ResolveOperation.GetOrCreateInstance(ISharingLifetimeScope currentOperationScope, ResolveRequest& request)
   at Microsoft.AspNetCore.Mvc.Controllers.ControllerFactoryProvider.<>c__DisplayClass6_0.<CreateControllerFactory>g__CreateController|0(ControllerContext controllerContext)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.InvokeInnerFilterAsync()
   --- End of stack trace from previous location ---
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.<InvokeNextResourceFilter>g__Awaited|25_0(ResourceInvoker invoker, Task lastTask, State next, Scope scope, Object state, Boolean isCompleted)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.Rethrow(ResourceExecutedContextSealed context)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ResourceInvoker.Next(State& next, Scope& scope, Object& state, Boolean& isCompleted)
   at Microsoft.AspNetCore.Authorization.AuthorizationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Authentication.AuthenticationMiddleware.Invoke(HttpContext context)
   at Microsoft.AspNetCore.Diagnostics.ExceptionHandlerMiddlewareImpl.<Invoke>g__Awaited|10_0(ExceptionHandlerMiddlewareImpl middleware, HttpContext context, Task task)
   at Microsoft.AspNetCore.Server.IIS.Core.IISHttpContextOfT\`1.ProcessRequestAsync()`,

  // Stack trace 2: Database timeout (EntityFramework)
  `System.Data.SqlClient.SqlException (0x80131904): Timeout expired. The timeout period elapsed prior to completion of the operation or the server is not responding.
   ---> System.ComponentModel.Win32Exception (0x80004005): The wait operation timed out
   at System.Data.SqlClient.SqlConnection.OnError(SqlException exception, Boolean breakConnection, Action\`1 wrapCloseInAction)
   at System.Data.SqlClient.TdsParser.ThrowExceptionAndWarning(TdsParserStateObject stateObj, Boolean callerHasConnectionLock, Boolean asyncClose)
   at System.Data.SqlClient.TdsParser.TryRun(RunBehavior runBehavior, SqlCommand cmdHandler, SqlDataReader dataStream, BulkCopySimpleResultSet bulkCopyHandler, TdsParserStateObject stateObj, Boolean& dataReady)
   at System.Data.SqlClient.SqlDataReader.TryConsumeMetaData()
   at System.Data.SqlClient.SqlDataReader.get_MetaData()
   at System.Data.SqlClient.SqlCommand.FinishExecuteReader(SqlDataReader ds, RunBehavior runBehavior, String resetOptionsString, Boolean isInternal, Boolean forDescribeParameterEncryption, Boolean shouldCacheForAlwaysEncrypted)
   at System.Data.SqlClient.SqlCommand.RunExecuteReaderTds(CommandBehavior cmdBehavior, RunBehavior runBehavior, Boolean returnStream, Boolean async, Int32 timeout, Task& task, Boolean asyncWrite, Boolean inRetry, SqlDataReader ds, Boolean describeParameterEncryptionRequest)
   at System.Data.SqlClient.SqlCommand.RunExecuteReader(CommandBehavior cmdBehavior, RunBehavior runBehavior, Boolean returnStream, String method, TaskCompletionSource\`1 completion, Int32 timeout, Task& task, Boolean& usedCache, Boolean asyncWrite, Boolean inRetry)
   at System.Data.SqlClient.SqlCommand.ExecuteReader(CommandBehavior behavior, String method)
   at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReader(RelationalCommandParameterObject parameterObject)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable\`1.Enumerator.InitializeReader(DbContext _, Boolean result)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable\`1.Enumerator.MoveNext()
   at System.Collections.Generic.List\`1..ctor(IEnumerable\`1 collection)
   at System.Linq.Enumerable.ToList[TSource](IEnumerable\`1 source)
   at ApplicationCore.Services.UserService.GetAllActiveUsers() in D:\\Projects\\Application\\Services\\UserService.cs:line 89
   at ApplicationCore.Controllers.UserController.GetUsers() in D:\\Projects\\Application\\Controllers\\UserController.cs:line 45
   at lambda_method123(Closure, Object)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.TaskOfActionResultExecutor.Execute(ActionContext actionContext, IActionResultTypeMapper mapper, ObjectMethodExecutor executor, Object controller, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.<InvokeActionMethodAsync>g__Awaited|12_0(ControllerActionInvoker invoker, ValueTask\`1 actionResultValueTask)`,

  // Stack trace 3: NullReferenceException (JavaScript/Node.js)
  `TypeError: Cannot read properties of null (reading 'userId')
   at UserService.getUserProfile (/app/src/services/user.service.js:156:28)
   at async AuthMiddleware.validateSession (/app/src/middleware/auth.middleware.js:89:18)
   at async Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
   at async next (/app/node_modules/express/lib/router/route.js:144:13)
   at async SessionMiddleware.checkSession (/app/src/middleware/session.middleware.js:67:7)
   at async Function.process_params (/app/node_modules/express/lib/router/index.js:346:13)
   at async next (/app/node_modules/express/lib/router/index.js:280:10)
   at async CorsMiddleware.handleCors (/app/node_modules/cors/lib/index.js:188:7)
   at async /app/src/app.js:45:3
   at async Server.<anonymous> (/app/node_modules/express/lib/application.js:652:7)`,

  // Stack trace 4: PostgreSQL constraint violation
  `Npgsql.PostgresException (0x80004005): 23505: duplicate key value violates unique constraint "users_email_key"
  Severity: ERROR
  SqlState: 23505
  MessageText: duplicate key value violates unique constraint "users_email_key"
  Detail: Key (email)=(john.doe@example.com) already exists.
  SchemaName: public
  TableName: users
  ConstraintName: users_email_key
  File: nbtinsert.c
  Line: 673
  Routine: _bt_check_unique
   at Npgsql.NpgsqlConnector.<ReadMessage>g__ReadMessageLong|194_0(NpgsqlConnector connector, Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
   at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
   at Npgsql.NpgsqlDataReader.NextResult()
   at Npgsql.NpgsqlCommand.ExecuteReader(CommandBehavior behavior, Boolean async, CancellationToken cancellationToken)
   at Npgsql.NpgsqlCommand.ExecuteReader(CommandBehavior behavior)
   at Npgsql.NpgsqlCommand.ExecuteNonQuery()
   at Dapper.SqlMapper.ExecuteCommand(IDbConnection cnn, ref CommandDefinition command, Action\`2 paramReader)
   at Dapper.SqlMapper.ExecuteImpl(IDbConnection cnn, ref CommandDefinition command)
   at Dapper.SqlMapper.Execute(IDbConnection cnn, String sql, Object param, IDbTransaction transaction, Nullable\`1 commandTimeout, Nullable\`1 commandType)
   at ApplicationCore.Repositories.UserRepository.CreateUser(User user) in C:\\Projects\\Repositories\\UserRepository.cs:line 234
   at ApplicationCore.Services.UserService.RegisterNewUser(UserRegistrationDto dto) in C:\\Projects\\Services\\UserService.cs:line 178
   at ApplicationCore.Controllers.AuthController.Register(UserRegistrationDto model) in C:\\Projects\\Controllers\\AuthController.cs:line 67`,

  // Stack trace 5: React component error
  `Error: Uncaught [Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.]
   at reportException (http://localhost:3000/static/js/bundle.js:1234:15)
   at renderWithHooks (http://localhost:3000/static/js/bundle.js:14567:28)
   at updateFunctionComponent (http://localhost:3000/static/js/bundle.js:16789:20)
   at beginWork (http://localhost:3000/static/js/bundle.js:19012:16)
   at HTMLUnknownElement.callCallback (http://localhost:3000/static/js/bundle.js:3945:14)
   at Object.invokeGuardedCallbackDev (http://localhost:3000/static/js/bundle.js:3994:16)
   at invokeGuardedCallback (http://localhost:3000/static/js/bundle.js:4056:31)
   at beginWork$1 (http://localhost:3000/static/js/bundle.js:23964:7)
   at performUnitOfWork (http://localhost:3000/static/js/bundle.js:22707:12)
   at workLoopSync (http://localhost:3000/static/js/bundle.js:22683:5)
   at renderRootSync (http://localhost:3000/static/js/bundle.js:22656:7)
   at performSyncWorkOnRoot (http://localhost:3000/static/js/bundle.js:22293:18)
   at scheduleUpdateOnFiber (http://localhost:3000/static/js/bundle.js:21907:7)
   at dispatchSetState (http://localhost:3000/static/js/bundle.js:16405:5)
   at UserDashboard.handleUpdate (http://localhost:3000/static/js/main.chunk.js:2345:9)
   at http://localhost:3000/static/js/main.chunk.js:2367:18`,

  // Stack trace 6: Redis connection error
  `StackExchange.Redis.RedisConnectionException: It was not possible to connect to the redis server(s). UnableToConnect on redis-cluster-01.production.local:6379/Interactive, Initializing/NotStarted, last: NONE, origin: BeginConnectAsync, outstanding: 0, last-read: 0s ago, last-write: 0s ago, keep-alive: 60s, state: Connecting, mgr: 10 of 10 available, last-heartbeat: never, global: 0s ago, v: 2.6.122.38350
   ---> System.Net.Sockets.SocketException (10061): No connection could be made because the target machine actively refused it.
   at System.Net.Sockets.Socket.AwaitableSocketAsyncEventArgs.ThrowException(SocketError error, CancellationToken cancellationToken)
   at System.Net.Sockets.Socket.AwaitableSocketAsyncEventArgs.System.Threading.Tasks.Sources.IValueTaskSource.GetResult(Int16 token)
   at System.Net.Sockets.Socket.<ConnectAsync>g__WaitForConnectWithCancellation|277_0(AwaitableSocketAsyncEventArgs saea, ValueTask connectTask, CancellationToken cancellationToken)
   at StackExchange.Redis.PhysicalConnection.ConnectAsync(EndPoint endpoint, ILogger log)
   --- End of inner exception stack trace ---
   at StackExchange.Redis.ConnectionMultiplexer.ConnectImpl(Func\`1 multiplexerFactory, TextWriter log)
   at StackExchange.Redis.ConnectionMultiplexer.Connect(String configuration, TextWriter log)
   at ApplicationCore.Services.CacheService.InitializeConnection() in D:\\Projects\\Services\\CacheService.cs:line 56
   at ApplicationCore.Services.CacheService.GetAsync[T](String key) in D:\\Projects\\Services\\CacheService.cs:line 89
   at ApplicationCore.Services.UserService.GetUserByIdWithCache(Guid userId) in D:\\Projects\\Services\\UserService.cs:line 234
   at ApplicationCore.Controllers.UserController.GetUser(Guid id) in D:\\Projects\\Controllers\\UserController.cs:line 112`,

  // Stack trace 7: Python Django error
  `Traceback (most recent call last):
  File "/usr/local/lib/python3.11/site-packages/django/core/handlers/exception.py", line 55, in inner
    response = get_response(request)
  File "/usr/local/lib/python3.11/site-packages/django/core/handlers/base.py", line 197, in _get_response
    response = wrapped_callback(request, *callback_args, **callback_kwargs)
  File "/usr/local/lib/python3.11/site-packages/django/views/decorators/csrf.py", line 56, in wrapped_view
    return view_func(*args, **kwargs)
  File "/app/core/views/user_views.py", line 145, in update_user_profile
    user = User.objects.get(id=user_id)
  File "/usr/local/lib/python3.11/site-packages/django/db/models/manager.py", line 87, in manager_method
    return getattr(self.get_queryset(), name)(*args, **kwargs)
  File "/usr/local/lib/python3.11/site-packages/django/db/models/query.py", line 637, in get
    raise self.model.DoesNotExist(
django.contrib.auth.models.User.DoesNotExist: User matching query does not exist.
During handling of the above exception, another exception occurred:
  File "/usr/local/lib/python3.11/site-packages/django/core/handlers/exception.py", line 55, in inner
    response = get_response(request)
  File "/usr/local/lib/python3.11/site-packages/django/db/backends/utils.py", line 98, in __exit__
    connection.close()
  File "/usr/local/lib/python3.11/site-packages/django/db/backends/postgresql/base.py", line 278, in close
    self.connection.close()
psycopg2.InterfaceError: connection already closed`,

  // Stack trace 8: Java Spring Boot error
  `org.springframework.web.util.NestedServletException: Request processing failed; nested exception is org.springframework.dao.DataIntegrityViolationException: could not execute statement; SQL [n/a]; constraint [fk_orders_user_id]; nested exception is org.hibernate.exception.ConstraintViolationException: could not execute statement
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014)
	at org.springframework.web.servlet.FrameworkServlet.doPost(FrameworkServlet.java:909)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:681)
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:883)
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:764)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:227)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162)
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:53)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:189)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:327)
	at org.springframework.security.web.access.intercept.FilterSecurityInterceptor.invoke(FilterSecurityInterceptor.java:115)
	at org.springframework.security.web.access.intercept.FilterSecurityInterceptor.doFilter(FilterSecurityInterceptor.java:81)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:336)
	at com.application.security.JwtAuthenticationFilter.doFilterInternal(JwtAuthenticationFilter.java:67)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:117)
	at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:336)
	at org.springframework.boot.actuate.metrics.web.servlet.WebMvcMetricsFilter.doFilterInternal(WebMvcMetricsFilter.java:96)
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:117)
Caused by: org.springframework.dao.DataIntegrityViolationException: could not execute statement; SQL [n/a]; constraint [fk_orders_user_id]; nested exception is org.hibernate.exception.ConstraintViolationException: could not execute statement
	at org.springframework.orm.jpa.vendor.HibernateJpaDialect.convertHibernateAccessException(HibernateJpaDialect.java:298)
	at org.springframework.orm.jpa.vendor.HibernateJpaDialect.translateExceptionIfPossible(HibernateJpaDialect.java:233)
	at org.springframework.orm.jpa.AbstractEntityManagerFactoryBean.translateExceptionIfPossible(AbstractEntityManagerFactoryBean.java:551)
	at com.application.services.OrderService.createOrder(OrderService.java:145)
	at com.application.controllers.OrderController.placeOrder(OrderController.java:89)
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77)
	at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)`,

  // Stack trace 9: Go panic
  `panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x7b4c89]

goroutine 1 [running]:
main.(*UserService).GetUserProfile(0xc0001b4000, {0x7ffed0f5b0a0?, 0xc00019e008?})
	/app/services/user_service.go:234 +0x89
main.(*UserController).HandleGetProfile(0xc0001b6000, 0xc0002d2000)
	/app/controllers/user_controller.go:145 +0x12b
github.com/gin-gonic/gin.(*Context).Next(...)
	/go/pkg/mod/github.com/gin-gonic/gin@v1.9.1/context.go:173
main.AuthMiddleware.func1(0xc0002d2000)
	/app/middleware/auth_middleware.go:67 +0x2e5
github.com/gin-gonic/gin.(*Context).Next(...)
	/go/pkg/mod/github.com/gin-gonic/gin@v1.9.1/context.go:173
github.com/gin-gonic/gin.CustomRecoveryWithWriter.func1(0xc0002d2000)
	/go/pkg/mod/github.com/gin-gonic/gin@v1.9.1/recovery.go:101 +0x78
github.com/gin-gonic/gin.(*Context).Next(...)
	/go/pkg/mod/github.com/gin-gonic/gin@v1.9.1/context.go:173
github.com/gin-gonic/gin.(*Engine).handleHTTPRequest(0xc0000a2000, 0xc0002d2000)
	/go/pkg/mod/github.com/gin-gonic/gin@v1.9.1/gin.go:616 +0x66b
github.com/gin-gonic/gin.(*Engine).ServeHTTP(0xc0000a2000, {0xd8f3e0?, 0xc00028e0e0}, 0xc0002d0000)
	/go/pkg/mod/github.com/gin-gonic/gin@v1.9.1/gin.go:572 +0x1dd
net/http.serverHandler.ServeHTTP({0xd8d8a0?}, {0xd8f3e0?, 0xc00028e0e0?}, 0x6?)
	/usr/local/go/src/net/http/server.go:2936 +0x316
net/http.(*conn).serve(0xc0002a4000, {0xd8fa68, 0xc00009c120})
	/usr/local/go/src/net/http/server.go:1995 +0x612`,

  // Stack trace 10: PHP Laravel error
  `[2024-01-15 14:23:45] production.ERROR: SQLSTATE[HY000]: General error: 1364 Field 'email' doesn't have a default value (SQL: insert into \`users\` (\`name\`, \`password\`, \`created_at\`, \`updated_at\`) values (John Doe, $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi, 2024-01-15 14:23:45, 2024-01-15 14:23:45)) {"exception":"[object] (Illuminate\\\\Database\\\\QueryException(code: HY000): SQLSTATE[HY000]: General error: 1364 Field 'email' doesn't have a default value at /var/www/html/vendor/laravel/framework/src/Illuminate/Database/Connection.php:742)
[stacktrace]
#0 /var/www/html/vendor/laravel/framework/src/Illuminate/Database/Connection.php(712): Illuminate\\\\Database\\\\Connection->runQueryCallback()
#1 /var/www/html/vendor/laravel/framework/src/Illuminate/Database/Connection.php(422): Illuminate\\\\Database\\\\Connection->run()
#2 /var/www/html/vendor/laravel/framework/src/Illuminate/Database/Connection.php(384): Illuminate\\\\Database\\\\Connection->statement()
#3 /var/www/html/vendor/laravel/framework/src/Illuminate/Database/Query/Processors/Processor.php(32): Illuminate\\\\Database\\\\Connection->insert()
#4 /var/www/html/vendor/laravel/framework/src/Illuminate/Database/Query/Builder.php(1484): Illuminate\\\\Database\\\\Query\\\\Processors\\\\Processor->processInsertGetId()
#5 /var/www/html/vendor/laravel/framework/src/Illuminate/Database/Eloquent/Builder.php(1708): Illuminate\\\\Database\\\\Query\\\\Builder->insertGetId()
#6 /var/www/html/vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php(1103): Illuminate\\\\Database\\\\Eloquent\\\\Builder->insertGetId()
#7 /var/www/html/app/Services/UserService.php(89): Illuminate\\\\Database\\\\Eloquent\\\\Model->save()
#8 /var/www/html/app/Http/Controllers/Auth/RegisterController.php(67): App\\\\Services\\\\UserService->createUser()
#9 /var/www/html/vendor/laravel/framework/src/Illuminate/Routing/Controller.php(54): App\\\\Http\\\\Controllers\\\\Auth\\\\RegisterController->register()
#10 /var/www/html/vendor/laravel/framework/src/Illuminate/Routing/ControllerDispatcher.php(43): Illuminate\\\\Routing\\\\Controller->callAction()`,
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'PostmanRuntime/7.35.0',
  'axios/1.6.2',
  'okhttp/4.12.0',
];

const URLS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/users/profile',
  '/api/orders/checkout',
  '/api/payments/process',
  '/api/files/upload',
  '/api/products/search',
  '/api/notifications/send',
  '/dashboard',
  '/settings/account',
  '/reports/analytics',
  null,
];

const APP_VERSIONS = ['1.0.0', '1.0.1', '1.1.0', '1.2.0', '2.0.0-beta', '2.0.0', '2.1.0', null];

const USER_IDS = [
  'user_001', 'user_002', 'user_003', 'user_042', 'user_123',
  'user_456', 'user_789', 'user_849', 'admin_001', null,
];

// ============================================
// Funciones auxiliares
// ============================================

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(daysBack: number): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return pastDate;
}

function generateMetadata(): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  const shouldHaveMetadata = Math.random() > 0.2; // 80% de probabilidad de tener metadata
  if (!shouldHaveMetadata) return Prisma.JsonNull;

  const metadata: Record<string, any> = {};

  // Request/Trace Information (90% probabilidad)
  if (Math.random() > 0.1) {
    metadata.connectionId = `${Math.floor(Math.random() * 99999999999999999999)}`;
    metadata.traceIdentifier = crypto.randomUUID();
    metadata.requestId = crypto.randomUUID();
    metadata.requestPath = randomElement([
      '/api/users/profile',
      '/api/orders/checkout',
      '/api/payments/process',
      '/api/auth/login',
      '/dashboard',
      '/admin/settings',
      '/vacancydetail/print',
      '/api/products/search',
    ]);
  }

  // Environment & Machine Info (80% probabilidad)
  if (Math.random() > 0.2) {
    metadata.environment = randomElement(['production', 'staging', 'development', 'qa']);
    metadata.machineName = randomElement([
      'web-prod-01',
      'api-prod-02',
      'worker-prod-03',
      'brawebdev01',
      'app-server-us-east-1a',
      'k8s-node-3c4d5e',
    ]);
    metadata.machineIP = randomElement([
      '10.100.3.4',
      '10.1.255.8',
      '172.16.0.15',
      '192.168.1.100',
      'fe80::7732:7108:d464:2a8a',
    ]);
  }

  // Application Context (70% probabilidad)
  if (Math.random() > 0.3) {
    metadata.applicationContext = randomElement([
      'Microfrontend.PublicArea',
      'BackendAPI.Core',
      'PaymentService',
      'NotificationWorker',
      'UserManagementAPI',
    ]);
    metadata.applicationVersion = randomElement(['2.5.1', '3.0.0', '2.4.8-beta', '1.9.12']);
  }

  // Performance Metrics (60% probabilidad)
  if (Math.random() > 0.4) {
    metadata.duration_ms = Math.floor(Math.random() * 15000) + 100;
    metadata.memoryUsage_mb = Math.floor(Math.random() * 2048) + 512;
    metadata.cpuUsage_percent = Math.floor(Math.random() * 100);
  }

  // Exception Details (70% probabilidad)
  if (Math.random() > 0.3) {
    metadata.exceptionDetail = {
      hResult: randomElement([-2146233088, -2146233086, -2147467259, -2146233079]),
      source: randomElement([
        'Autofac',
        'System.Private.CoreLib',
        'Microsoft.EntityFrameworkCore',
        'Npgsql',
        'ApplicationCore',
      ]),
      targetSite: randomElement([
        'Void Execute(ResolveRequestContext, Action)',
        'Object Instantiate()',
        'Void ThrowSubstringArgumentOutOfRange(Int32, Int32)',
        'Task ExecuteAsync(HttpContext)',
      ]),
    };

    // Inner exception (50% probabilidad si hay exceptionDetail)
    if (Math.random() > 0.5) {
      metadata.exceptionDetail.innerException = {
        type: randomElement([
          'System.ArgumentOutOfRangeException',
          'System.NullReferenceException',
          'System.InvalidOperationException',
          'System.TimeoutException',
        ]),
        message: randomElement([
          'startIndex cannot be larger than length of string',
          'Object reference not set to an instance of an object',
          'Sequence contains no elements',
          'Operation timed out',
        ]),
      };
    }
  }

  // Database Info (50% probabilidad)
  if (Math.random() > 0.5) {
    metadata.database = {
      connectionString: 'Server=prod-db-01;Database=ApplicationDB;',
      commandTimeout: randomElement([30, 60, 120]),
      transactionId: crypto.randomUUID(),
      affectedRows: Math.floor(Math.random() * 1000),
    };
  }

  // HTTP Context (60% probabilidad)
  if (Math.random() > 0.4) {
    metadata.httpContext = {
      method: randomElement(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
      statusCode: randomElement([200, 400, 401, 403, 404, 500, 502, 503]),
      protocol: 'HTTP/1.1',
      scheme: randomElement(['http', 'https']),
      host: randomElement([
        'api.example.com',
        'www.application.com',
        'localhost:3000',
        'prod.backend.io',
      ]),
      queryString: Math.random() > 0.5 ? '?page=1&limit=50&sort=desc' : '',
    };
  }

  // User/Session Info (50% probabilidad)
  if (Math.random() > 0.5) {
    metadata.sessionId = crypto.randomUUID();
    metadata.correlationId = crypto.randomUUID();
    metadata.userRole = randomElement(['Admin', 'User', 'Guest', 'Moderator']);
    metadata.ipAddress = randomElement([
      '203.0.113.45',
      '198.51.100.23',
      '192.0.2.156',
      '10.0.0.45',
    ]);
  }

  // Tags & Classification (70% probabilidad)
  if (Math.random() > 0.3) {
    const allTags = [
      'critical',
      'payment',
      'auth',
      'security',
      'performance',
      'database',
      'network',
      'validation',
      'timeout',
      'memory-leak',
      'deadlock',
      'rate-limit',
    ];
    const numTags = Math.floor(Math.random() * 3) + 1;
    metadata.tags = [];
    for (let i = 0; i < numTags; i++) {
      const tag = randomElement(allTags);
      if (!metadata.tags.includes(tag)) {
        metadata.tags.push(tag);
      }
    }
  }

  // Retry & Circuit Breaker Info (40% probabilidad)
  if (Math.random() > 0.6) {
    metadata.retryCount = Math.floor(Math.random() * 5);
    metadata.circuitBreakerState = randomElement(['Closed', 'Open', 'HalfOpen']);
    metadata.lastRetryAt = new Date(Date.now() - Math.random() * 60000).toISOString();
  }

  // Additional Context (30% probabilidad)
  if (Math.random() > 0.7) {
    metadata.additionalData = {
      feature: randomElement(['checkout', 'user-profile', 'payment-processing', 'file-upload']),
      tenant: randomElement(['tenant_001', 'tenant_042', 'tenant_123']),
      locale: randomElement(['en-US', 'es-ES', 'ca-ES', 'fr-FR']),
      timezone: randomElement(['UTC', 'Europe/Madrid', 'America/New_York']),
    };
  }

  // Event ID (80% probabilidad)
  if (Math.random() > 0.2) {
    metadata.eventId = {
      id: Math.floor(Math.random() * 9999),
      name: randomElement([
        'ApplicationError',
        'DatabaseError',
        'AuthenticationFailure',
        'ValidationError',
        'SystemException',
      ]),
    };
  }

  return Object.keys(metadata).length > 0 ? metadata : Prisma.JsonNull;
}

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function main() {
  console.log('Seeding database...');

  // Status (IDs fijos según DATABASE.md)
  const statuses = [
    { id: 1, name: 'PENDING' },
    { id: 2, name: 'ACTIVE' },
    { id: 3, name: 'EXPIRED' },
    { id: 4, name: 'DELETED' },
  ];

  for (const status of statuses) {
    await prisma.status.upsert({
      where: { id: status.id },
      update: {},
      create: status,
    });
  }
  console.log(`✓ ${statuses.length} Status records`);

  // Level (IDs fijos, todos con statusId = 2 (ACTIVE))
  const levels = [
    { id: 1, name: 'DEBUG', order: 1, statusId: 2 },
    { id: 2, name: 'INFO', order: 2, statusId: 2 },
    { id: 3, name: 'WARNING', order: 3, statusId: 2 },
    { id: 4, name: 'ERROR', order: 4, statusId: 2 },
    { id: 5, name: 'FATAL', order: 5, statusId: 2 },
  ];

  for (const level of levels) {
    await prisma.level.upsert({
      where: { id: level.id },
      update: {},
      create: level,
    });
  }
  console.log(`✓ ${levels.length} Level records`);

  // Platforms de ejemplo (para desarrollo)
  // Iconos disponibles: Lucide (LuXxx), Font Awesome (FaXxx), Ionicons (IoXxx)
  const platforms = [
    { id: 1, name: 'Web', icon: 'LuMonitor', statusId: 2 },
    { id: 2, name: 'WM', icon: 'LuSmartphone', statusId: 2 },
    { id: 3, name: 'Android', icon: 'IoLogoAndroid', statusId: 2 },
    { id: 4, name: 'iOS', icon: 'IoLogoApple', statusId: 2 },
    { id: 5, name: 'API', icon: 'LuServer', statusId: 2 },
  ];

  for (const platform of platforms) {
    const existing = await prisma.platform.findUnique({
      where: { id: platform.id },
    });

    if (!existing) {
      await prisma.platform.create({
        data: {
          id: platform.id,
          name: platform.name,
          icon: platform.icon,
          apiKey: generateApiKey(),
          statusId: platform.statusId,
        },
      });
    } else {
      // Actualizar icon siempre para reflejar cambios
      await prisma.platform.update({
        where: { id: platform.id },
        data: { icon: platform.icon },
      });
    }
  }
  console.log(`✓ ${platforms.length} Platform records`);

  // Usuario administrador inicial
  const adminEmail = 'admin@excepio.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin Excepio',
        role: UserRole.ADMINISTRADOR,
        statusId: 2, // ACTIVE
      },
    });
    console.log('✓ Admin user created (admin@excepio.com / Admin123!)');
  } else {
    console.log('✓ Admin user already exists');
  }

  // Usuario básico inicial
  const userEmail = 'user@excepio.com';
  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('User123!', 10);
    await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        name: 'Usuario Excepio',
        role: UserRole.USUARIO,
        statusId: 2, // ACTIVE
      },
    });
    console.log('✓ Basic user created (user@excepio.com / User123!)');
  } else {
    console.log('✓ Basic user already exists');
  }

  // Excepciones de ejemplo (para desarrollo)
  await seedExceptions();

  console.log('Database seeded successfully!');
}

async function seedExceptions() {
  const existingCount = await prisma.exception.count();
  if (existingCount > 0) {
    console.log(`✓ Exceptions already exist (${existingCount} records)`);
    return;
  }

  const exceptions: Prisma.ExceptionCreateManyInput[] = [];

  // Generar 500 excepciones con distribución realista
  for (let i = 0; i < 500; i++) {
    // Distribución de levels: más errores y warnings que debug/info
    const levelWeights = [
      { id: 1, weight: 0.05 },  // DEBUG - 5%
      { id: 2, weight: 0.10 },  // INFO - 10%
      { id: 3, weight: 0.25 },  // WARNING - 25%
      { id: 4, weight: 0.45 },  // ERROR - 45%
      { id: 5, weight: 0.15 },  // FATAL - 15%
    ];

    const rand = Math.random();
    let cumulative = 0;
    let levelId = 4; // Default ERROR
    for (const level of levelWeights) {
      cumulative += level.weight;
      if (rand < cumulative) {
        levelId = level.id;
        break;
      }
    }

    // Distribución de platforms (Web y Mobile más frecuentes)
    const platformId = randomElement([1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5]); // Web más frecuente

    exceptions.push({
      platformId,
      levelId,
      message: randomElement(EXCEPTION_MESSAGES),
      stackTrace: Math.random() > 0.15 ? randomElement(STACK_TRACES) : null, // 85% con stack trace
      userId: randomElement(USER_IDS),
      url: randomElement(URLS),
      userAgent: randomElement(USER_AGENTS),
      appVersion: randomElement(APP_VERSIONS),
      metadata: generateMetadata(),
      createdAt: randomDate(60), // Últimos 60 días para más variedad temporal
    });
  }

  // Insertar en lotes para mejor rendimiento
  await prisma.exception.createMany({
    data: exceptions,
  });

  console.log(`✓ ${exceptions.length} Exception records`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
