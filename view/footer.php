<style>
    /* ========================================================================== */
    /* Footer */
    /* ========================================================================== */

    .site-footer {
        background-color: #0D2366;
        color: #D1D5DB;
        padding: 5px 5px 0;
        border-top: 1px solid #374151;
        font-family: Arial, Helvetica, sans-serif;
    }


    /* -------------------------------------------------------------------------- */
    /* Barre inférieure */
    /* -------------------------------------------------------------------------- */

    .site-footer__bottom {
        max-width: 1000px;

        margin: 25px auto 0;
        padding: 12px 10px;

        border-top: 1px solid rgba(255, 255, 255, 0.5);

        text-align: center;

        background-color: #0D2366;
        color: #FFFFFF;

        font-size: 14px;
        line-height: 1.4;
    }


    /* -------------------------------------------------------------------------- */
    /* Responsive */
    /* -------------------------------------------------------------------------- */

    @media (max-width: 768px) {

        .site-footer {
            padding: 20px 15px 0;
        }

        .site-footer__bottom {
            margin-top: 25px;
        }
    }
</style>


<footer class="site-footer">




    <!-- Copyright -->
    <div class="site-footer__bottom">
        &copy; <?= date('Y') ?> Guy Verghote. Tous droits réservés.
    </div>

</footer>
