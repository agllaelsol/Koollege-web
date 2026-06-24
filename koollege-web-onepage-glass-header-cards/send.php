<?php
declare(strict_types=1);

// ===== SECURITY HEADERS =====
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Método no permitido');
}

// Honeypot
if (!empty($_POST['website'] ?? '')) {
    http_response_code(204);
    exit;
}

// Rate limiting: máx 5 envíos por sesión
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$_SESSION['form_sends'] = ($_SESSION['form_sends'] ?? 0) + 1;
if ($_SESSION['form_sends'] > 5) {
    http_response_code(429);
    exit('Demasiados intentos. Intenta más tarde.');
}

// ===== SANITIZACIÓN CON LÍMITES =====
function clean(string $value, int $max = 255): string
{
    return mb_substr(trim(str_replace(["\r", "\n"], ' ', strip_tags($value))), 0, $max);
}

$name       = clean($_POST['name']        ?? '');
$email      = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$phone      = clean($_POST['phone']       ?? '', 30);
$role       = clean($_POST['role']        ?? '', 80);
$school     = clean($_POST['school']      ?? '', 120);
$schoolSize = clean($_POST['school_size'] ?? '', 40);
$demoDate   = clean($_POST['demo_date']   ?? '', 20);
$demoTime   = clean($_POST['demo_time']   ?? '', 20);
$interest   = clean($_POST['interest']    ?? '', 80);
$message    = mb_substr(strip_tags(trim($_POST['message'] ?? '')), 0, 1000);

// Validación obligatoria
if ($name === '' || !$email || $school === '') {
    http_response_code(422);
    exit('Por favor completa nombre, correo e institución.');
}

// Validación de dominio MX (reduce correos inventados)
if (function_exists('checkdnsrr')) {
    $domain = substr((string)$email, (int)strpos((string)$email, '@') + 1);
    if (!checkdnsrr($domain, 'MX') && !checkdnsrr($domain, 'A')) {
        http_response_code(422);
        exit('El dominio del correo no parece válido.');
    }
}

// ===== ENVÍO =====
$to      = 'contacto@koollege.com';
$subject = '=?UTF-8?B?' . base64_encode('Nueva solicitud de demo Koollege') . '?=';
$body    = implode("\n", [
    "Nombre: {$name}",
    "Correo: {$email}",
    "Teléfono: {$phone}",
    "Cargo: {$role}",
    "Institución: {$school}",
    "Tamaño: {$schoolSize}",
    "Fecha preferida: {$demoDate}",
    "Horario preferido: {$demoTime}",
    "Módulo principal: {$interest}",
    '',
    'Qué quiere revisar:',
    $message,
]);

$headers = implode("\r\n", [
    'From: Koollege Web <no-reply@koollege.com>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
]);

$sent = mail($to, $subject, $body, $headers);

// ===== RESPUESTA =====
if (str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['ok' => $sent]);
    exit;
}

header('Location: contacto/?enviado=' . ($sent ? '1' : '0'));
exit;
