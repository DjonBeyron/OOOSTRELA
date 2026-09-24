// Окно «Загрузка файлов закрыта»: показывается по нажатию на скрепку, пока админ не разрешил файлы.
import { ProhibitedIcon } from '../../shared/ui/icons'

export default function FilesDeniedPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <section
        className="sheet denied"
        role="alertdialog"
        aria-labelledby="denied-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ProhibitedIcon className="denied-icon" />
        <h2 id="denied-title" className="label-caps">Загрузка файлов закрыта</h2>
        <p>
          Загрузку файлов необходимо согласовать с директором ООО «Стрела» —
          Мазохой Сергеем Владимировичем.
        </p>
        <p className="denied-note">Пока доступ к загрузке запрещён. Задавать вопросы текстом можно как обычно.</p>
        <button className="btn btn-primary label-caps" onClick={onClose} autoFocus>
          Понятно
        </button>
      </section>
    </div>
  )
}
