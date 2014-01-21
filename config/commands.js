module.exports = {
    pull: 'cd **path**; git reset --hard HEAD; git clean -f -d; git pull origin master;',
    notify: 'echo "**message**" | mail **email** -s "**hostname** :' + new Date().toString() + '"'
};