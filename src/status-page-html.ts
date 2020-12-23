export default `<html>
  <head>
    <title>Processes</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.0.4/socket.io.min.js"></script>
    <style>
      body {
        font-family: sans-serif;
        max-width: 700px;
        margin-top: 32px;
        margin-right: auto;
        margin-left: auto;  
      }
      #processes, #header {
        opacity: 0;
        transform: translateY(-6px);
        transition: opacity 0.2s, transform 0.3s;
      }
      #header {
        transform: translateY(-3px);
      }
      .process {
        display: flex;
        padding: 20px 18px 8px 26px;
        border: 1px solid #eee;
        border-radius: 6px;
        margin-bottom: 6px;
      }
      .process.error {
        border: 1px solid #f57c7c;
        padding: 14px 18px 12px 18px;
        background: rgb(251, 220, 220);
      }
      .process * {
        margin-right: 12px;
        position: relative;
        min-width: 100px;
      }
      .process *::before {
        position: absolute;
        top: -16px;
        left: 0px;
        font-size: 13px;
        color: rgba(0,0,0,0.4);
      }
      .process .status { min-width: 75px; }
      .process .status::before { content: "Status"; }
      .process .name::before { content: "Name"; }
      .process .name { min-width: 150px; }
      .process .uptime::before { content: "Uptime"; }
      .process .memory::before { content: "Memory"; }
      .process .cpu::before { content: "CPU"; }
      .process .status::after { 
        content: "";
        height: 11px;
        width: 11px;
        border-radius: 6px;
        position: absolute;
        left: -18px;
        top: 3px;
        box-shadow: inset 0 0 3px 0px rgba(0,0,0,0.3);
      }
      .process .status.online::after { background: #70db4b; }
      .process .status.stopping::after { background: #e7c242; }
      .process .status.launching::after { background: #e7c242; }
      .process .status.one-launch-status::after { background: #e7c242; }
      .process .status.stopped::after { background: #ed4a4a; }
      .process .status.errored::after { background: #ed4a4a; }
      .process *:last-child {
        margin-right: 0px;
      }
    </style>
  </head>
  <body>
    <h1 id="header">Processes</h1>
    <div id="processes"></div>
  </body>
  <script>
    const socket = io()
    function getUptime(uptime) {
      var date = new Date(uptime)
      var year = date.getYear() - 70 // unix epoch offset
      var month = date.getMonth()
      var day = date.getDate() - 4 // unix epoch offset
      var hour = date.getHours() - 1 // unix epoch offset
      var min = date.getMinutes()
      var sec = date.getSeconds()

      if (year > 0) { return year + ' Year' + (year > 0 ? 's' : '') }
      if (month > 0) { return month + ' Month' + (month > 0 ? 's' : '') }
      if (day > 0) { return day + ' Day' + (day > 0 ? 's' : '') }
      if (hour > 0) { return hour + ' Hour' + (hour > 0 ? 's' : '') }
      if (min > 0) { return min + ' Minute' + (min > 0 ? 's' : '') }
      return sec + ' Second' + (sec > 0 ? 's' : '')
    }

    function anim(id) {
      document.getElementById(id).style.opacity = 1
      document.getElementById(id).style.transform = 'translateY(0px)'
    }

    socket.on('connect', () => {
      anim('header')
      socket.emit('getStates')
    })
    socket.on('stateChange', states => {
      anim('processes')
      document.getElementById('processes').innerHTML = states.map(s => \`<div class="process">
        <div class="status \${s.status}">\${s.status}</div>
        <div class="name">\${s.name}</div>
        <div class="uptime">\${getUptime(s.uptime)}</div>
        <div class="memory">\${(s.memory / 1024 / 1024).toFixed(1)} MB</div>
        <div class="cpu">\${s.cpu}%</div>
      </div>\`).join('\\n')
    })
    setInterval(() => socket.emit('getStates'), 2500)
    setTimeout(() => {
      if (!socket.connected) {
        anim('header')
        anim('processes')
        document.getElementById('processes').innerHTML = \`<div class="process error">
          <span>Connection failed.</span>
        </div>\`
      }
    }, 5000)
  </script>
</html>`