function login() {
    var id = document.getElementById('id').value;
    var password = document.getElementById('password').value;
    var userType = document.getElementById('userType').value;

    // 这里应该是与后端API进行验证的逻辑
    // 为了演示，我们使用一个简单的条件
    if (id && password && userType) {
        // 登录成功，跳转到已存在的系统
        window.location.href = 'http://localhost:4200';
    } else {
        alert('登录失败，请检查您的凭据或注册新账户。');
    }
}

function register() {
    var id = document.getElementById('id').value;
    var password = document.getElementById('password').value;
    var userType = document.getElementById('userType').value;

    // 这里应该是与后端API进行注册的逻辑
    // 为了演示，我们使用一个简单的条件
    if (id && password && userType) {
        alert('注册成功！请返回登录页面。');
        window.location.href = 'login.html';
    } else {
        alert('注册失败，请确保所有字段都已填写。');
    }
}