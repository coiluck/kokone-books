package moe.coiluck.kokone_books

import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.view.ViewTreeObserver
import android.graphics.Rect
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    window.decorView.systemUiVisibility = (
      View.SYSTEM_UI_FLAG_FULLSCREEN
      or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
      or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
      or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
      or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
      or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
    )

    window.setFlags(
      WindowManager.LayoutParams.FLAG_FULLSCREEN,
      WindowManager.LayoutParams.FLAG_FULLSCREEN
    )

    setupKeyboardListener()
  }

  private fun setupKeyboardListener() {
    val rootView = window.decorView.findViewById<View>(android.R.id.content)

    rootView.viewTreeObserver.addOnGlobalLayoutListener(object : ViewTreeObserver.OnGlobalLayoutListener {
      private var isKeyboardShowing = false

      override fun onGlobalLayout() {
        val rect = Rect()
        rootView.getWindowVisibleDisplayFrame(rect)
        val screenHeight = rootView.height
        val keypadHeight = screenHeight - rect.bottom

        // キーボードが画面の10%以上を占める場合、表示されていると判定
        val isKeyboardNowShowing = keypadHeight > screenHeight * 0.10

        if (isKeyboardNowShowing != isKeyboardShowing) {
          isKeyboardShowing = isKeyboardNowShowing

          if (isKeyboardShowing) {
            // キーボードが表示された時
            rootView.setPadding(0, 0, 0, keypadHeight)
          } else {
            // キーボードが非表示になった時
            rootView.setPadding(0, 0, 0, 0)
          }
        }
      }
    })
  }
}
