//go:build windows

package api

import (
	"os/exec"
	"strconv"
)

func setProcessGroup(_ *exec.Cmd) {}

func killProcessGroup(cmd *exec.Cmd) {
	if cmd == nil || cmd.Process == nil {
		return
	}
	_ = exec.Command("taskkill", "/T", "/F", "/PID", strconv.Itoa(cmd.Process.Pid)).Run()
}
