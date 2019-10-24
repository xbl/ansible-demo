使用 `jdeathe/centos-ssh:2.6.1` 作为 Centos 的基础镜像，实现免登录等。

配置host

```
127.0.0.1 app1.example.com
127.0.0.1 app2.example.com
127.0.0.1 www.example.com
```

在主机上执行：
```shell
ssh-keygen -t rsa
```

在 `~/.ssh` 目录生成 `id_rsa.pub` 把文件内容贴到 `docker-compose.yml` 的环境变量 `SSH_AUTHORIZED_KEYS`。

``` shell
docker-compose build
```



```shell
docker-compose up
```

停止

```shell
docker-compose down
```



## 配置 Ansible Inventory 文件

默认路径为 `/etc/ansible/hosts` ，这里放到当前工程的 `inventory/hosts`

```ini
[app:children]
app1
app2

[app1]
app1.example.com:2021 ansible_user=root

[app2]
app2.example.com:2022 ansible_user=root

[nginx]
www.example.com:2023 ansible_user=root
```

`app` 包含两个子组 `app1` 和 `app2`, 在 ansible-playbook 中的 `- hosts: app` 可对 `app1` 、`app2` 同时批量操作。

`ansible_user` 是登录用户，`sudo` 和 `su` 的密码可以通过 `ansible_become_password` 来设置。更多内容请查看[官方文档](https://docs.ansible.com/ansible/latest/user_guide/intro_inventory.html)。

验证一下：

```shell
ansible all -m ping -i ./inventory/hosts
```

## 实践

部署 APP

```shell
ansible-playbook -i ./inventory/hosts deploy-app.yml
```

第一次执行的时候会有被忽略的报错，使用 `pm2 delete server` 会报错，因为 server 还不存在，所以此动作的错误是被忽略的，无需惊慌。

访问 [http://app1.example.com:8081/](http://app1.example.com:8081/)



Reload NGINX

```shell
ansible-playbook -i ./inventory/hosts reload-nginx.yml
```

访问 [http://www.example.com/api/](http://www.example.com/api/)



更新 `files/app/server.js` 的版本号，再部署 APP

```shell
ansible-playbook -i ./inventory/hosts deploy-app.yml
```

访问 [http://www.example.com/api/](http://www.example.com/api/)



回滚 APP

```shell
ansible-playbook -i ./inventory/hosts rollback-app.yml
```

访问 [http://www.example.com/api/](http://www.example.com/api/)



清除 APP

```shell
ansible-playbook -i ./inventory/hosts clean-app.yml
```



注意：

重启之后再连接 ssh 会出现下面警告⚠️：

```shell
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
The fingerprint for the ECDSA key sent by the remote host is
SHA256:i53TuHTrI6YfhGBwJnnxFIReSf9sMlxy2Ksn178jBTo.
Please contact your system administrator.
Add correct host key in ~/.ssh/known_hosts to get rid of this message.
Offending ECDSA key in ~/.ssh/known_hosts:3
ECDSA host key for [app1.example.com]:2021 has changed and you have requested strict checking.
Host key verification failed.
```

找到 `~/.ssh/known_hosts:` 中已经存在的 host 配置删掉即可。

Or 

```shell
ssh -o "StrictHostKeyChecking no" user@host
```

还有另一种办法，修改 `/etc/ssh/ssh_config`

```ini
Host *.example.com
    StrictHostKeyChecking no
```

