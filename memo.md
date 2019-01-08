# README

```bash
# Adminを作成
$ docker-compose exec ejabberd bin/ejabberdctl register admin localhost passw0rd
User admin@localhost successfully registered
```

```bash
# ステータスを確認
$ docker-compose exec ejabberd bin/ejabberdctl status
The node ejabberd@8b873afab2b2 is started with status: started ejabberd 18.6.0 is running in that node
```
