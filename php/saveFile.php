<?php
    $dir = urldecode($_POST["dir"]);
    $filename = urldecode($_POST["filename"]);
    $content = urldecode($_POST["content"]);

    mkdir('saves/example');

    copy('./index.html', 'saves/example/index.html');
    copy('./index.js', 'saves/example/index.js');
    $file = fopen('saves/example/'.$filename, 'w') or die("Can't open file");
    fwrite($file, $content);
    fclose($file);
?>