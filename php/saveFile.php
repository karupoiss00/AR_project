<?php
    $dir = urldecode($_POST["dir"]);
    $filename = urldecode($_POST["filename"]);
    $content = urldecode($_POST["content"]);

    mkdir('/tmp/'.$dir, 0777, true);

    copy('./index.html', '/tmp/'.$dir.'/index.html');
    copy('./index.js', '/tmp/'.$dir.'/index.js');
    $file = fopen('/tmp/'.$dir.'/'.$filename, 'w') or die("Can't open file");
    fwrite($file, $content);
    fclose($file);
?>