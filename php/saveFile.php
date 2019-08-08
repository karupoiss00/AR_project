<?php
    $filename = $_POST["filename"];
    $content = $_POST["content"];
    $file = fopen($filename, 'w') or die("Can't open file");
    fwrite($file, $content);
    fclose($file);
?>