import { appendPengaduan, updatePengaduanStatus } from "@/lib/google-sheets";
import { sendTelegramMessage, sendTelegramPhotoByUrl } from "@/lib/telegram";
import { generateId } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nama_lengkap, nik, status_warga, no_hp, kategori, isi_laporan, url_foto } = data;

    if (!nama_lengkap || !status_warga || !no_hp || !kategori || !isi_laporan) {
      return NextResponse.json(
        { success: false, message: "Data pengaduan tidak lengkap." },
        { status: 400 }
      );
    }

    const id = `PGD-${Date.now()}-${generateId(5)}`;
    const tanggal = new Date().toISOString();
    const status = "Menunggu";

    // 1. Send to Telegram
    const isWargaLokal = status_warga === "Warga Lokal";
    const wargaIcon = isWargaLokal ? "🏡" : "🧳";
    
    const caption = `🚨 <b>LAPORAN BARU DARI WARGA</b>\n\n👤 <b>Nama:</b> ${nama_lengkap}\n📝 <b>NIK:</b> ${nik || "-"}\n${wargaIcon} <b>Status:</b> ${status_warga}\n📞 <b>No HP/WA:</b> <a href="https://wa.me/${no_hp.replace(/^0/, '62').replace(/\D/g, '')}">${no_hp}</a>\n🏷 <b>Kategori:</b> ${kategori}\n\n💬 <b>Isi Laporan:</b>\n<i>"${isi_laporan}"</i>\n\n📅 <b>Tanggal:</b> ${new Date().toLocaleString("id-ID")}\n🆔 <b>ID:</b> ${id}`;

    // If there is an image URL from Cloudinary, send as Photo.
    // If not, maybe we should just send text, but for now we require photo or we send a placeholder?
    // Actually, we'll try to send the photo. If it fails or no photo, we could fallback, but let's assume photo is required or optional.
    if (url_foto) {
      await sendTelegramPhotoByUrl(url_foto, caption);
    } else {
      await sendTelegramMessage(caption);
    }

    // 2. Save to Google Sheets
    const appended = await appendPengaduan({
      id,
      nama_lengkap,
      nik: nik || "",
      status_warga,
      no_hp,
      kategori,
      isi_laporan,
      url_foto: url_foto || "",
      status,
      tanggal,
    });

    if (!appended) {
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan pengaduan ke database." },
        { status: 500 }
      );
    }

    revalidateTag("pengaduan", "max");

    return NextResponse.json({
      success: true,
      message: "Laporan berhasil dikirim.",
      data: { id },
    });
  } catch (error) {
    console.error("POST Pengaduan Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memproses laporan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const data = await request.json();
    const { status } = data;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "ID dan status wajib disertakan." },
        { status: 400 }
      );
    }

    const updated = await updatePengaduanStatus(id, status);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui status pengaduan." },
        { status: 500 }
      );
    }

    revalidateTag("pengaduan", "max");

    return NextResponse.json({
      success: true,
      message: "Status berhasil diperbarui.",
    });
  } catch (error) {
    console.error("PATCH Pengaduan Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memproses pembaruan." },
      { status: 500 }
    );
  }
}
