<?php
declare(strict_types=1);

function clean_value(string $value): string
{
    return trim(str_replace(["\r", "\n"], ' ', strip_tags($value)));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Método no permitido');
}

if (!empty($_POST['website'] ?? '')) {
    http_response_code(204);
    exit;
}

$name = clean_value($_POST['name'] ?? '');
$email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
$phone = clean_value($_POST['phone'] ?? '');
$role = clean_value($_POST['role'] ?? '');
$school = clean_value($_POST['school'] ?? '');
$schoolSize = clean_value($_POST['school_size'] ?? '');
$demoDate = clean_value($_POST['demo_date'] ?? '');
$demoTime = clean_value($_POST['demo_time'] ?? '');
$interest = clean_value($_POST['interest'] ?? '');
$message = trim(strip_tags($_POST['message'] ?? ''));

if ($name === '' || !$email || $school === '') {
    http_response_code(422);
    exit('Por favor completa nombre, correo e institución.');
}

$to = 'contacto@koollege.com';
$subject = 'Nueva solicitud de demo Koollege';
$body = "Nombre: {$name}\nCorreo: {$email}\nTeléfono: {$phone}\nCargo: {$role}\nInstitución: {$school}\nTamaño: {$schoolSize}\nFecha preferida: {$demoDate}\nHorario preferido: {$demoTime}\nMódulo principal: {$interest}\n\nQué quiere revisar:\n{$message}\n";
$headers = [
    'From: Koollege Web <no-reply@koollege.com>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8'
];

$sent = mail($to, $subject, $body, implode("\r\n", $headers));

if (str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['ok' => $sent]);
    exit;
}

header('Location: contacto/?enviado=' . ($sent ? '1' : '0'));
exit;
