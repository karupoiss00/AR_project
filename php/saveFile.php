<?php
    $dir = urldecode($_POST["dir"]);
    $filename = urldecode($_POST["filename"]);
    $content = urldecode($_POST["content"]);

    copy('saves/js/index.html', 'saves/'.$dir.'index.html');
    copy('saves/js/index.js', 'saves/'.$dir.'index.js');
    $file = fopen($dir.$filename, 'w') or die("Can't open file");
    fwrite($file, $content);
    fclose($file);
?>