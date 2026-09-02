use crate::device;

#[tauri::command]
pub fn get_device_id() -> Result<String, String> {
    device::create_device_id()
}