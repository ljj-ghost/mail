#!/usr/bin/env bash

set -euo pipefail

if [[ "$(id -u)" -eq 0 ]]; then
  SUDO=""
  TARGET_USER="${SUDO_USER:-root}"
else
  if ! command -v sudo >/dev/null 2>&1; then
    echo "sudo 未安装，请先切到 root 用户执行。"
    exit 1
  fi
  SUDO="sudo"
  TARGET_USER="${USER}"
fi

if [[ ! -f /etc/os-release ]]; then
  echo "无法识别系统版本，缺少 /etc/os-release。"
  exit 1
fi

. /etc/os-release

install_on_debian() {
  ${SUDO} apt-get update
  ${SUDO} apt-get install -y ca-certificates curl gnupg
  ${SUDO} install -m 0755 -d /etc/apt/keyrings
  curl -fsSL "https://download.docker.com/linux/${ID}/gpg" | ${SUDO} gpg --yes --dearmor -o /etc/apt/keyrings/docker.gpg
  ${SUDO} chmod a+r /etc/apt/keyrings/docker.gpg

  local arch codename repo_id
  arch="$(dpkg --print-architecture)"
  codename="${VERSION_CODENAME:-$(. /etc/os-release && echo "${UBUNTU_CODENAME:-}")}"
  repo_id="${ID}"

  echo \
    "deb [arch=${arch} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${repo_id} ${codename} stable" \
    | ${SUDO} tee /etc/apt/sources.list.d/docker.list >/dev/null

  ${SUDO} apt-get update
  ${SUDO} apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
}

install_on_rhel() {
  local pm
  if command -v dnf >/dev/null 2>&1; then
    pm="dnf"
  else
    pm="yum"
  fi

  ${SUDO} ${pm} install -y yum-utils
  ${SUDO} yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
  ${SUDO} ${pm} install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
}

case "${ID}" in
  ubuntu|debian)
    install_on_debian
    ;;
  centos|rhel|rocky|almalinux|ol|fedora)
    install_on_rhel
    ;;
  *)
    echo "暂未支持当前系统: ${ID}"
    echo "可以告诉我你的 Linux 发行版，我再给你补对应安装脚本。"
    exit 1
    ;;
esac

${SUDO} systemctl enable docker
${SUDO} systemctl restart docker

if ! getent group docker >/dev/null 2>&1; then
  ${SUDO} groupadd docker
fi

if [[ -n "${TARGET_USER}" && "${TARGET_USER}" != "root" ]]; then
  ${SUDO} usermod -aG docker "${TARGET_USER}" || true
fi

echo
docker --version || true
docker compose version || true
echo
echo "Docker 已安装完成。"
echo "如果你是第一次加入 docker 用户组，重新登录后再执行 docker 命令会更稳。"
