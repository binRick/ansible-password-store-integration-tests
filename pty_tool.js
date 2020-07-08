#!/usr/bin/env node

var os = require('os'),
    l = console.log,
    child_process = require('child_process'),
    pty = require('node-pty');

var PASS_TO_ENTER = process.env.PASS_TO_ENTER;

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}


var killed = child_process.execSync('killall -9 gpg2 gpg-agent 2>/dev/null || true');

var BASH_ARGS = [
    'ls', 'acme/sharedpass',
];
var ptyProcess = pty.spawn('pass', BASH_ARGS, {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
});
var read_data = '';
ptyProcess.on('data', function(data) {
    process.stdout.write(data);
    if (read_data == '') {
        setTimeout(function() {
            ptyProcess.write(PASS_TO_ENTER + '\r');
        }, 100);
    }
    read_data += data.toString();
});

ptyProcess.on('exit', function(code) {
    var first_line = read_data.split('\n')[0].trim();
    l('exited code', code, 'with', read_data.length, 'bytes and', read_data.split('\n').length, 'lines of output. \n\n first line="' + first_line + '".\n\n');
});
