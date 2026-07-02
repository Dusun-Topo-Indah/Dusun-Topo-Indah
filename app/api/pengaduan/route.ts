import { appendPengaduan, updatePengaduanStatus } from "@/lib/google-sheets";
import { sendTelegramMessage, sendTelegramPhoto } from "@/lib/telegram";
import { generateId } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const nama_lengkap = formData.get("nama_lengkap") as string;
    const nik = formData.get("nik") as string;
    const status_warga = formData.get("status_warga") as string;
    const no_hp = formData.get("no_hp") as string;
    const kategori = formData.get("kategori") as string;
    const isi_laporan = formData.get("isi_laporan") as string;
    const file = formData.get("file") as File | null;

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
    const isWargaLokal = status_warga === "Warga Lokal" || status_warga === "Warga"; // Note: we changed label to "Pengunjung" but value is "Bukan Warga Lokal"
    const wargaIcon = isWargaLokal ? "🏡" : "🧳";
    
    const caption = `🚨 <b>LAPORAN BARU DARI WARGA</b>\n\n👤 <b>Nama:</b> ${nama_lengkap}\n📝 <b>NIK:</b> ${nik || "-"}\n${wargaIcon} <b>Status:</b> ${status_warga}\n📞 <b>No HP/WA:</b> <a href="https://wa.me/${no_hp.replace(/^0/, '62').replace(/\D/g, '')}">${no_hp}</a>\n🏷 <b>Kategori:</b> ${kategori}\n\n💬 <b>Isi Laporan:</b>\n<i>"${isi_laporan}"</i>\n\n📅 <b>Tanggal:</b> ${new Date().toLocaleString("id-ID")}\n🆔 <b>ID:</b> ${id}`;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      await sendTelegramPhoto(buffer, file.name, file.type, caption);
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
      url_foto: "",
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
