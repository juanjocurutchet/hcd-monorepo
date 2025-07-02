import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-[#0e4c7d] text-white py-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">Honorable Concejo Deliberante</h3>
                <p className="mb-2">Rivadavia 421</p>
                <p className="mb-2">Las Flores, Buenos Aires</p>
                <p className="mb-4">Teléfono: 2244444452</p>
                <div className="flex space-x-4">
                  <Link
                    href="https://www.youtube.com/channel/UCRVvtXaJETjQvbqUVvOkZAQ"
                    target="_blank"
                    className="hover:text-blue-300"
                  >
                    <Image src="/youtube-icon.png" alt="YouTube" width={24} height={24} />
                  </Link>
                  <Link href="https://www.facebook.com/hcdlasflores" target="_blank" className="hover:text-blue-300">
                    <Image src="/facebook-icon.png" alt="Facebook" width={24} height={24} />
                  </Link>
                  <Link href="https://twitter.com/hcdlasflores" target="_blank" className="hover:text-blue-300">
                    <Image src="/twitter-icon.png" alt="Twitter" width={24} height={24} />
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Enlaces rápidos</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="hover:underline">
                      Inicio
                    </Link>
                  </li>
                  <li>
                    <Link href="/novedades" className="hover:underline">
                      Novedades
                    </Link>
                  </li>
                  <li>
                    <Link href="/sesiones" className="hover:underline">
                      Sesiones
                    </Link>
                  </li>
                  <li>
                    <Link href="/legislacion" className="hover:underline">
                      Legislación
                    </Link>
                  </li>
                  <li>
                    <Link href="/contacto" className="hover:underline">
                      Contacto
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">El Concejo</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/concejo/autoridades" className="hover:underline">
                      Autoridades
                    </Link>
                  </li>
                  <li>
                    <Link href="/concejo/concejales" className="hover:underline">
                      Concejales
                    </Link>
                  </li>
                  <li>
                    <Link href="/concejo/bloques" className="hover:underline">
                      Bloques políticos
                    </Link>
                  </li>
                  <li>
                    <Link href="/concejo/comisiones" className="hover:underline">
                      Comisiones
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-4">Ubicación</h3>
            <div className="h-[200px] w-full relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3222.5076517698397!2d-59.09715492427655!3d-36.05583997990829!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95978d9a9f11a6c7%3A0x8caac55cdbf7c9c6!2sRivadavia%20421%2C%20Las%20Flores%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1716249600000!5m2!1ses!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-blue-700 text-center">
          <p>
            &copy; {new Date().getFullYear()} Honorable Concejo Deliberante de Las Flores. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
