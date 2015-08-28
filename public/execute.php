<?php
file_put_contents(__DIR__.'/execute.txt', $_GET['command'].PHP_EOL, FILE_APPEND);
