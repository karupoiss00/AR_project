<?php
    $dir = urldecode($_POST["dir"]);
    $filename = urldecode($_POST["filename"]);
    $content = urldecode($_POST["content"]);

    chdir('saves');
    mkdir($dir);
    copy('php/index.html', '/saves/'.$dir.'/index.html');
    copy('php/index.js', '/saves/'.$dir.'/index.js');
    $file = fopen('saves/'.$dir.'/'.$filename, 'w') or die("Can't open file");
    fwrite($file, $content);
    fclose($file);
?>