use nvml_wrapper::Nvml;
use std::error::Error;

#[derive(Debug, Clone)]
pub struct GpuMetrics {
    pub vram_used_mb: u64,
    pub vram_total_mb: u64,
}

pub fn get_gpu_vram() -> Result<GpuMetrics, Box<dyn Error>> {
    let nvml = Nvml::init()?;

    let device = nvml.device_by_index(0)?;
    
    let mem_info = device.memory_info()?;
    
    Ok(GpuMetrics {
        vram_used_mb: mem_info.used / 1_024 / 1_024,
        vram_total_mb: mem_info.total / 1_024 / 1_024,
    })
}