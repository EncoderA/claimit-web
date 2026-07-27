#!/usr/bin/env bash
# =============================================================================
# scripts/gitleaks.sh
# =============================================================================
# Local pre-commit hook script to run Gitleaks.
# - Fail-closed security model
# - Auto-downloads pinned version if not installed
# - Verifies SHA256 checksums before running
# =============================================================================

set -euo pipefail

GITLEAKS_VERSION="8.18.2" # Pinned version
TOOLS_DIR=".tools"
GITLEAKS_BIN="${TOOLS_DIR}/gitleaks"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

fail() {
    echo -e "\n${RED}Unable to obtain or execute Gitleaks.${NC}"
    echo -e "${RED}Please check your internet connection or install Gitleaks manually.${NC}"
    echo -e "${RED}Commit aborted.${NC}\n"
    exit 1
}

# 1. Check if installed globally
if command -v gitleaks >/dev/null 2>&1; then
    EXEC_CMD="gitleaks"
# 2. Check if cached locally
elif [ -f "${GITLEAKS_BIN}" ] || [ -f "${GITLEAKS_BIN}.exe" ]; then
    if [ -f "${GITLEAKS_BIN}.exe" ]; then
        EXEC_CMD="${GITLEAKS_BIN}.exe"
    else
        EXEC_CMD="${GITLEAKS_BIN}"
    fi
else
    # 3. Download pinned version
    echo -e "${YELLOW}Gitleaks not found locally or globally. Downloading v${GITLEAKS_VERSION}...${NC}"
    mkdir -p "${TOOLS_DIR}"
    
    OS="$(uname -s)"
    ARCH="$(uname -m)"
    
    case "$OS" in
        Linux) OS_NAME="linux" ;;
        Darwin) OS_NAME="darwin" ;;
        MINGW*|CYGWIN*|MSYS*) OS_NAME="windows" ;;
        *) echo -e "${RED}Unsupported OS: $OS${NC}"; fail ;;
    esac

    case "$ARCH" in
        x86_64|amd64) ARCH_NAME="x64" ;;
        arm64|aarch64) ARCH_NAME="arm64" ;;
        *) echo -e "${RED}Unsupported architecture: $ARCH${NC}"; fail ;;
    esac
    
    EXT="tar.gz"
    if [ "$OS_NAME" = "windows" ]; then
        EXT="zip"
    fi
    
    ARCHIVE_NAME="gitleaks_${GITLEAKS_VERSION}_${OS_NAME}_${ARCH_NAME}.${EXT}"
    DOWNLOAD_URL="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/${ARCHIVE_NAME}"
    CHECKSUM_URL="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_checksums.txt"
    
    ARCHIVE_PATH="${TOOLS_DIR}/${ARCHIVE_NAME}"
    CHECKSUM_PATH="${TOOLS_DIR}/checksums.txt"
    
    curl -sL --fail "$DOWNLOAD_URL" -o "$ARCHIVE_PATH" || fail
    curl -sL --fail "$CHECKSUM_URL" -o "$CHECKSUM_PATH" || fail
    
    # 4. Verify checksum
    echo -e "${CYAN}Verifying checksum...${NC}"
    EXPECTED_SHA=$(grep "$ARCHIVE_NAME" "$CHECKSUM_PATH" | awk '{print $1}' || true)
    if [ -z "$EXPECTED_SHA" ]; then
        echo -e "${RED}Checksum for $ARCHIVE_NAME not found in checksums.txt${NC}"
        rm -f "$ARCHIVE_PATH" "$CHECKSUM_PATH"
        fail
    fi
    
    ACTUAL_SHA=""
    if command -v sha256sum >/dev/null 2>&1; then
        ACTUAL_SHA=$(sha256sum "$ARCHIVE_PATH" | awk '{print $1}')
    elif command -v shasum >/dev/null 2>&1; then
        ACTUAL_SHA=$(shasum -a 256 "$ARCHIVE_PATH" | awk '{print $1}')
    else
        echo -e "${RED}No sha256sum or shasum command found for verification.${NC}"
        rm -f "$ARCHIVE_PATH" "$CHECKSUM_PATH"
        fail
    fi
    
    if [ "$EXPECTED_SHA" != "$ACTUAL_SHA" ]; then
        echo -e "${RED}Checksum verification failed!${NC}"
        echo -e "${RED}Expected: $EXPECTED_SHA${NC}"
        echo -e "${RED}Actual  : $ACTUAL_SHA${NC}"
        rm -f "$ARCHIVE_PATH" "$CHECKSUM_PATH"
        fail
    fi
    
    echo -e "${GREEN}Checksum verified successfully.${NC}"
    
    # Extract
    if [ "$EXT" = "zip" ]; then
        if command -v unzip >/dev/null 2>&1; then
            unzip -q -o "$ARCHIVE_PATH" -d "${TOOLS_DIR}" || fail
        else
            powershell -Command "Expand-Archive -Path '${ARCHIVE_PATH}' -DestinationPath '${TOOLS_DIR}' -Force" >/dev/null 2>&1 || fail
        fi
    else
        tar -xzf "$ARCHIVE_PATH" -C "${TOOLS_DIR}" gitleaks || fail
    fi
    
    # Clean up archive
    rm -f "$ARCHIVE_PATH" "$CHECKSUM_PATH"
    
    if [ "$OS_NAME" = "windows" ]; then
        EXEC_CMD="${GITLEAKS_BIN}.exe"
    else
        chmod +x "${GITLEAKS_BIN}"
        EXEC_CMD="${GITLEAKS_BIN}"
    fi
fi

# 5. Secret Scanning
echo -e "${CYAN}Running Gitleaks scan...${NC}"
CONFIG_ARGS=()
if [ -f ".gitleaks.toml" ]; then
    CONFIG_ARGS+=("--config" ".gitleaks.toml")
fi

# Run Gitleaks fail-closed
if ! "$EXEC_CMD" protect --staged -v --redact "${CONFIG_ARGS[@]}"; then
    echo ""
    echo -e "${RED}❌ Gitleaks detected secrets. Commit blocked.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Gitleaks scan passed. No secrets detected.${NC}"
exit 0