<?php
    $dir = urldecode($_POST["dir"]);
    $filename = urldecode($_POST["filename"]);
    $content = urldecode($_POST["content"]);

    copy('./index.html', '/saves/test/index.html');
    copy('./index.js', '/saves/test/index.js');
    $file = fopen('/saves/test/'.$filename, 'w') or die("Can't open file");
    fwrite($file, $content);
    fclose($file);
?>