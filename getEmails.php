<?php

$content = json_decode(file_get_contents(__DIR__ . '/src/data/email.json'), true, 512, JSON_THROW_ON_ERROR);
$content = array_values($content);
$emails = [];
foreach ($content as $user) {
    $emails = [...$emails, ...$user["emails"]];
}
$nbRawEmails = count($emails);
$emails = array_unique($emails);
$nbRawUniqueEmails = count($emails);
$emails = array_filter($emails, static function (string $mail) {
    $split = explode('@', $mail);
    return !(count($split) !== 2 || str_contains($mail, 'noreply'));
});
$nbEmails = count($emails);
$stats = [];
foreach ($emails as $email) {
    $split = explode('@', $email);
    if (!isset($stats[$split[1]])) {
        $stats[$split[1]] = 0;
    }
    $stats[$split[1]]++;
}
arsort($stats);
$statsOrder = array_flip(array_keys($stats));
usort($emails, static function (string $a, string $b) use ($statsOrder) {
    return $statsOrder[explode('@', $a)[1]] <=> $statsOrder[explode('@', $b)[1]];
});
file_put_contents(__DIR__ . '/src/data/listEmail.json', json_encode($emails, JSON_THROW_ON_ERROR));
