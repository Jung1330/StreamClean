#[cfg(windows)]
use std::ffi::OsStr;
#[cfg(windows)]
use std::os::windows::ffi::OsStrExt;
#[cfg(windows)]
use std::ptr;

/// Returns true if the current process is running with Administrator privileges.
#[cfg(windows)]
pub fn is_admin() -> bool {
    use windows_sys::Win32::Security::{
        AllocateAndInitializeSid, CheckTokenMembership, FreeSid, SECURITY_NT_AUTHORITY,
    };
    // SECURITY_BUILTIN_DOMAIN_RID = 0x20, DOMAIN_ALIAS_RID_ADMINS = 0x220
    const SECURITY_BUILTIN_DOMAIN_RID: u32 = 0x0000_0020;
    const DOMAIN_ALIAS_RID_ADMINS: u32 = 0x0000_0220;

    unsafe {
        let mut nt_authority = SECURITY_NT_AUTHORITY;
        let mut admin_group: *mut core::ffi::c_void = ptr::null_mut();
        let ok = AllocateAndInitializeSid(
            &mut nt_authority,
            2,
            SECURITY_BUILTIN_DOMAIN_RID,
            DOMAIN_ALIAS_RID_ADMINS,
            0,
            0,
            0,
            0,
            0,
            0,
            &mut admin_group,
        );
        if ok == 0 || admin_group.is_null() {
            return false;
        }
        let mut is_member: i32 = 0;
        let check = CheckTokenMembership(ptr::null_mut(), admin_group, &mut is_member);
        FreeSid(admin_group);
        check != 0 && is_member != 0
    }
}

#[cfg(not(windows))]
pub fn is_admin() -> bool {
    false
}

/// Restarts the current executable with UAC elevation ("runas").
#[cfg(windows)]
pub fn restart_as_admin() -> Result<(), String> {
    use windows_sys::Win32::UI::Shell::ShellExecuteW;
    use windows_sys::Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL;

    let exe = std::env::current_exe().map_err(|e| format!("Failed to locate executable: {e}"))?;

    let verb = to_wide("runas");
    let file = to_wide(exe.as_os_str());

    unsafe {
        let result = ShellExecuteW(
            ptr::null_mut(),
            verb.as_ptr(),
            file.as_ptr(),
            ptr::null(),
            ptr::null(),
            SW_SHOWNORMAL,
        );
        // ShellExecuteW returns a value > 32 on success.
        if (result as isize) <= 32 {
            return Err("UAC elevation was cancelled or failed.".to_string());
        }
    }
    Ok(())
}

#[cfg(not(windows))]
pub fn restart_as_admin() -> Result<(), String> {
    Err("UAC elevation is only supported on Windows.".to_string())
}

/// Queries the total size (bytes) and item count in the Windows Recycle Bin.
#[cfg(windows)]
pub fn query_recycle_bin() -> (u64, u64) {
    use windows_sys::Win32::UI::Shell::{SHQueryRecycleBinW, SHQUERYRBINFO};

    unsafe {
        let mut info: SHQUERYRBINFO = std::mem::zeroed();
        info.cbSize = std::mem::size_of::<SHQUERYRBINFO>() as u32;
        let hr = SHQueryRecycleBinW(ptr::null(), &mut info);
        if hr == 0 {
            let size = info.i64Size.max(0) as u64;
            let count = info.i64NumItems.max(0) as u64;
            (size, count)
        } else {
            (0, 0)
        }
    }
}

#[cfg(not(windows))]
pub fn query_recycle_bin() -> (u64, u64) {
    (0, 0)
}

/// Silently empties the Windows Recycle Bin. Returns (cleaned_bytes, deleted_items).
#[cfg(windows)]
pub fn empty_recycle_bin() -> (u64, u64) {
    use windows_sys::Win32::UI::Shell::{
        SHEmptyRecycleBinW, SHERB_NOCONFIRMATION, SHERB_NOPROGRESSUI, SHERB_NOSOUND,
    };

    let (before_size, before_count) = query_recycle_bin();
    if before_count == 0 && before_size == 0 {
        return (0, 0);
    }

    unsafe {
        let flags = SHERB_NOCONFIRMATION | SHERB_NOPROGRESSUI | SHERB_NOSOUND;
        let hr = SHEmptyRecycleBinW(ptr::null_mut(), ptr::null(), flags);
        if hr == 0 {
            let (after_size, after_count) = query_recycle_bin();
            (
                before_size.saturating_sub(after_size),
                before_count.saturating_sub(after_count),
            )
        } else {
            (0, 0)
        }
    }
}

#[cfg(not(windows))]
pub fn empty_recycle_bin() -> (u64, u64) {
    (0, 0)
}

#[cfg(windows)]
fn to_wide<S: AsRef<OsStr>>(s: S) -> Vec<u16> {
    s.as_ref().encode_wide().chain(std::iter::once(0)).collect()
}
