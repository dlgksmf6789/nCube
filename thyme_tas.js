/**
 * Created by Il Yeup, Ahn in KETI on 2017-02-25.
 */

/**
 * Copyright (c) 2018, OCEAN
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 3. The name of the author may not be used to endorse or promote products derived from this software without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// for TAS
var net = require('net');
var ip = require('ip');

global.socket_arr = {};

var tas_buffer = {};
exports.buffer = tas_buffer;
var exec = require('child_process').exec;

var _server = null;
exports.ready_for_tas = function ready_for_tas () {
    if(_server == null) {

        _server = net.createServer(function (socket) {

            console.log('socket connected');
            socket.id = Math.random() * 1000;
            tas_buffer[socket.id] = '';

            socket.on('data', thyme_tas_handler);
            socket.on('end', function() {
                console.log('end');
            });
            socket.on('close', function() {
                console.log('close');
            });
            socket.on('error', function(e) {
                console.log('error ', e);
            });
        });

        _server.listen(conf.ae.tasport, function() {
            console.log('TCP Server (' + ip.address() + ') for TAS is listening on port ' + conf.ae.tasport);
        });
    }
};

function thyme_tas_handler (data) {
    // 'this' refers to the socket calling this callback.

    tas_buffer[this.id] += data.toString();
    //console.log(tas_buffer[this.id]);
    var data_arr = tas_buffer[this.id].split('<EOF>');
    if(data_arr.length >= 2) {
        for (var i = 0; i < data_arr.length-1; i++) {
            var line = data_arr[i];
            tas_buffer[this.id] = tas_buffer[this.id].replace(line+'<EOF>', '');

            var jsonObj = JSON.parse(line);
            var ctname = jsonObj.ctname;
            var content = jsonObj.con;

            socket_arr[ctname] = this;

            console.log('----> got data for [' + ctname + '] from tas ---->');
		
            if (jsonObj.con == 'hello') {
                this.write(line + '<EOF>');
            }
            else {
                if (sh_state == 'crtci') {
		    console.log(11111111111);
                    exec('sudo python3 NBKG.py',(error, stdout, stderr)=>{if (error){
			console.error('exec error: ${error}');
			return;
			}

		    var result = stdout.split(',');
		    

                    for (var j = 0; j < conf.cnt.length; j++) {
                        var parent = conf.cnt[j].parent + '/' + conf.cnf[j].name;
                        sh_adn.crtci(parent, j, result[j], this, function(status, res_body, to, socket){
                            console.log('x-m2m-rsc11:'+status+'<-----');
                        });
                        console.log(conf.cnt[j].name + ':' + result[j]);
                        if (j == 1){
                            break;
                        }
                    }
                });
                }
            }
        }
    }
}

