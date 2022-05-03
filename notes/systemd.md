# Systemd



## Basic

```bash
systemctl start example.service
systemctl stop example.service
systemctl restart example.service

systemctl reload example.service
systemctl reload-or-restart example.service

# enable and disable service
systemctl enable example.service
systemctl disable example.service

# check status of services
systemctl status example.service
systemctl is-active example.service
systemctl is-enabled example.service
systemctl is-failed example.service

# list all of the active units.
systemctl list-units
systemctl list-units --all
systemctl list-units --all --state=inactive
systemctl list-units --type=service
systemctl list-units --type=target

# list all unit file
systemctl list-unit-files

# daemon-reload
systemctl daemon-reload

```



## Unit Management

```bash
# display unit
systemctl cat example.service

# display dependencies
systemctl list-dependencies example.service

# show properties of unit
systemctl show example.service

# mask and unmask unit
# masked unit: Completely disabled, so that any start operation on it fails
systemctl mask example.service
systemctl unmask example.service

# edit unit file
## create an override.conf for specific unit
systemctl edit example.service
## edit the full unit file
systemctl edit --full nginx.service

```



## Different types of unit

### Service units

```
A unit configuration file whose name ends in .service encodes information
about a process controlled and supervised by systemd.
```

### Socket units

```
A unit configuration file whose name ends in ".socket" encodes information
about an IPC or network socket or a file system FIFO controlled
and supervised by systemd, for socket-based activation.
```

example

```bash
# hello.socket
cat <<EOF | sudo tee /etc/systemd/system/hello.socket
[Unit]
Description=Hello Server

[Socket]
ListenStream=3300
Accept=yes

[Install]
WantedBy=sockets.target
EOF
```

```bash
# hello@.service
cat <<EOF | sudo tee /etc/systemd/system/hello@.service
[Unit]
Description=Hello Server Service

[Service]
ExecStart=/usr/local/bin/hello.py
StandardInput=socket
EOF
```

```python
# create file at /usr/local/bin/hello.py
#!/usr/bin/python3
import sys
sys.stdout.write(sys.stdin.readline().strip().upper() + '\r\n')
```

```bash
# clean up
sudo rm /etc/systemd/system/hello.socket /etc/systemd/system/hello@.service /usr/local/bin/hello.py
```

### Target units

```
A unit configuration file whose name ends in ".target" encodes information
about a target unit of systemd, which is used for
grouping units and as well-known synchronization points during start-up.
```



## Shortcuts

```bash
# rescue (single-user) mode
systemctl rescue

# halt the system
systemctl halt

# full shutdown
systemctl poweroff

# reboot
systemctl reboot
```



## References

- [systemd.service ](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [systemd.socket](https://www.freedesktop.org/software/systemd/man/systemd.socket.html)
- [systemd.target](https://www.freedesktop.org/software/systemd/man/systemd.target.html)
- [How To Use Systemctl to Manage Systemd Services and Units](https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units)
- [The End of the Road: systemd's "Socket" Units](https://www.linux.com/blog/end-road-systemds-socket-units)

