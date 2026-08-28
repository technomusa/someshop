<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // For API routes, allow Bearer token authentication without CSRF tokens
        // The frontend will handle authentication via Bearer tokens in headers
        $middleware->statefulApi();

        // Exclude API routes from CSRF protection as they use Bearer tokens
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        // Register role middleware alias
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
