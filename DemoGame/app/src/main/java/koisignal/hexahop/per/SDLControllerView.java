package koisignal.hexahop.per;

import android.content.Context;
import android.media.Image;
import androidx.annotation.NonNull;
//import androidx.constraintlayout;
//import androidx.constraintlayout.widget.ConstraintLayout;
import android.os.CountDownTimer;
import android.widget.Button;
import android.widget.RelativeLayout;

import android.util.Log;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.BaseInputConnection;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

public class SDLControllerView extends RelativeLayout {

    private ViewGroup vg;

    public static ImageView ldButton;
    public static ImageView rdButton;//; = (ImageView) findViewById(R.id.rd_button);
    public static ImageView luButton;// = (ImageView) findViewById(R.id.lu_button);
    public static ImageView ruButton;// = (ImageView) findViewById(R.id.ru_button);
    public static ImageView upButton;// = (ImageView) findViewById(R.id.up_button);
    public static ImageView downButton;// = (ImageView) findViewById(R.id.down_button);
    public static ImageView bButton;// = (ImageView) findViewById(R.id.b_button);
    public static ImageView cButton;// = (ImageView) findViewById(R.id.c_button);



    public SDLControllerView(@NonNull Context context, ViewGroup vg) {
        super(context);
        inflate(context, R.layout.gamepad, this);
        this.vg = vg;
        this.vg.addView(this);


         ldButton = (ImageView) findViewById(R.id.ld_button);
         rdButton = (ImageView) findViewById(R.id.rd_button);
         luButton = (ImageView) findViewById(R.id.lu_button);
         ruButton = (ImageView) findViewById(R.id.ru_button);
         upButton = (ImageView) findViewById(R.id.up_button);
         downButton = (ImageView) findViewById(R.id.down_button);
        bButton = (ImageView) findViewById(R.id.b_button);
        cButton = (ImageView) findViewById(R.id.c_button);


        ldButton.setOnTouchListener(new ControllerTouchListener(KeyEvent.KEYCODE_A));
        rdButton.setOnTouchListener(new ControllerTouchListener(KeyEvent.KEYCODE_D));
        luButton.setOnTouchListener(new ControllerTouchListener(KeyEvent.KEYCODE_Q));
        ruButton.setOnTouchListener(new ControllerTouchListener(KeyEvent.KEYCODE_E));

        upButton.setOnTouchListener(new ControllerTouchListener(KeyEvent.KEYCODE_W));
        downButton.setOnTouchListener(new ControllerTouchListener(KeyEvent.KEYCODE_S));

        bButton.setOnTouchListener(new ControllerTouchListener(KeyEvent.KEYCODE_U));
        cButton.setOnTouchListener(new ControllerTouchListener(KeyEvent.KEYCODE_ESCAPE));
    }

    private boolean sendKey(int action, int keycode) {
        BaseInputConnection bic = new BaseInputConnection(this.vg, true);
        return bic.sendKeyEvent(new KeyEvent(action, keycode));
    }

    class ControllerTouchListener implements OnTouchListener {

        private int thisKeyCode;

        public ControllerTouchListener(int keyCode) {
            this.thisKeyCode = keyCode;
        }

        @Override
        public boolean onTouch(View view, MotionEvent motionEvent) {
            sendKey(motionEvent.getAction(), this.thisKeyCode);
            return true;
        }
    }


}
