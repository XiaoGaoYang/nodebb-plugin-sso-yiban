<div class="row">
  <div class="col-lg-9">
    <div class="panel panel-defalt">
      <div class="panel-heading">
        <i class="fa fa-qq"></i> 易班社交认证
      </div>
      <div class="panel-body">
        <p>在易班注册一个应用，然后把相关信息粘贴在这里</p>
        <br>
        <form class="sso-yiban">
          <div class="form-group">
            <label for="id">AppID</label>
            <input type="text" name="id" title="AppID" class="form-control" placeholder="AppID"><br />
          </div>
          <div class="form-group">
            <label for="secret">AppSecret</label>
            <input type="text" name="secret" title="AppSecret" class="form-control" placeholder="AppSecret">
          </div>
        </form>
      </div>
    </div>
  </div>
  <div class="col-lg-3">
    <div class="panel panel-default">
      <div class="panel-heading">易班控制面板</div>
      <div class="panel-body">
        <button class="btn btn-primary" id="save">保存设置</button>
      </div>
    </div>
  </div>
</div>

<script>
  require(['settings'], function(Settings) {
    Settings.load('sso-yiban', $('.sso-yiban'));

    $('#save').on('click', function() {
      console.log('yiban-click');
      Settings.save('sso-yiban', $('.sso-yiban'), function() {
        console.log('save success');
        app.alert({
          type: 'success',
          alert_id: 'yiban-saved',
          title: 'Settings Saved',
          message: '请重启你的NodeBB来应用这些设置',
          clickfn: function() {
            socket.emit('admin.reload');
          }
        });
      });
    });
  });
</script>